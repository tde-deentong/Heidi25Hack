import uuid
import os
import tempfile
import shutil
import time
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse
from typing import Optional
import asyncio
import json

from .schemas import StartSessionRequest, StartSessionResponse, AnswerRequest, QAItem, NextQuestionResponse
from .openai_client import transcribe_audio_file, generate_next_question
from .utils.tts import text_to_speech_bytes
from . import db
from datetime import datetime

router = APIRouter()

# In-memory session store (for demo; use MongoDB for production)
_sessions = {}

DEFAULT_QUESTIONS = [
    "What is the main reason for your visit today?",
    "How long have you had these symptoms?",
    "Are you currently taking any medications?",
    "Do you have any allergies to medication?",
]

@router.post("/start_session")
async def start_session(payload: StartSessionRequest):
    t_start = time.time()
    print(f"[TIMER] /start_session called")
    
    session_id = str(uuid.uuid4())
    domain_qs = payload.domain_questions or DEFAULT_QUESTIONS
    first_question = domain_qs[0]

    doc = {
        "session_id": session_id,
        "patient_name": payload.patient_name,
        "domain_questions": domain_qs,
        "qas": [],
        "qa_count": 0,
        "created_at": datetime.utcnow(),
        "done": False,
    }

    # persist to MongoDB for efficiency
    try:
        col = db.get_db()["sessions"]
        await col.insert_one(doc)
        print(f"[TIMER] /start_session DB insert ({time.time() - t_start:.2f}s)")
    except Exception as e:
        print(f"[TIMER] /start_session DB error, falling back to in-memory ({time.time() - t_start:.2f}s): {e}")
        # fallback to in-memory store if DB unavailable
        _sessions[session_id] = doc

    print(f"[TIMER] /start_session completed ({time.time() - t_start:.2f}s)")
    return StartSessionResponse(session_id=session_id, first_question=first_question)

@router.post("/answer")
async def answer(
    session_id: str = Form(...),
    question: str = Form(...),
    text: Optional[str] = Form(None),
    audio: Optional[UploadFile] = File(None),
    domain_questions: Optional[str] = Form(None),
):
    """Accept an answer either as text or as uploaded audio file. Saves Q/A and returns next question or done=true.

    domain_questions: optional JSON list string of seed questions (to override defaults)
    """
    t_start = time.time()
    print(f"[TIMER] /answer started")
    
    if not text and not audio:
        raise HTTPException(status_code=400, detail="Provide either 'text' or an 'audio' file")

    answer_text = text
    temp_file_path = None
    if audio:
        # save to temp file
        suffix = os.path.splitext(audio.filename)[1] or '.wav'
        fd, temp_file_path = tempfile.mkstemp(suffix=suffix)
        with open(fd, 'wb') as f:
            content = await audio.read()
            f.write(content)
        print(f"[TIMER] /answer audio file written ({time.time() - t_start:.2f}s)")
        
        # transcribe
        try:
            t_whisper = time.time()
            answer_text = await transcribe_audio_file(temp_file_path)
            print(f"[TIMER] /answer Whisper API ({time.time() - t_whisper:.2f}s)")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Transcription failed: {e}")
        finally:
            try:
                os.remove(temp_file_path)
            except Exception:
                pass

    qa_item = {"question": question, "answer": answer_text, "timestamp": datetime.utcnow()}

    # Try to push to MongoDB and increment qa_count atomically for efficiency
    try:
        col = db.get_db()["sessions"]
        update_result = await col.update_one(
            {"session_id": session_id},
            {"$push": {"qas": qa_item}, "$inc": {"qa_count": 1}}
        )
        if update_result.matched_count == 0:
            raise HTTPException(status_code=404, detail="session not found")

        # fetch recent QAs (limit to last 10) for LLM context
        doc = await col.find_one({"session_id": session_id}, {"qas": {"$slice": -10}})
        prev_qas = doc.get("qas", []) if doc else []
    except HTTPException:
        raise
    except Exception:
        # fallback to in-memory store
        if session_id not in _sessions:
            raise HTTPException(status_code=404, detail="session not found")
        _sessions[session_id]["qas"].append(qa_item)
        _sessions[session_id]["qa_count"] = _sessions[session_id].get("qa_count", 0) + 1
        prev_qas = _sessions[session_id]["qas"]

    print(f"[TIMER] /answer DB write ({time.time() - t_start:.2f}s)")

    # parse domain_questions if provided
    domain_qs = None
    if domain_questions:
        import json
        try:
            domain_qs = json.loads(domain_questions)
            print(f"[DEBUG] Domain questions received: {domain_qs}")
        except Exception as e:
            print(f"[DEBUG] Failed to parse domain_questions: {e}")
            domain_qs = None

    # ask OpenAI for next question (use recent prev_qas for context)
    try:
        t_llm = time.time()
        gen = await generate_next_question(prev_qas, domain_qs or DEFAULT_QUESTIONS)
        print(f"[DEBUG] OpenAI response: {gen}")
        print(f"[TIMER] /answer OpenAI LLM call ({time.time() - t_llm:.2f}s)")
    except Exception as e:
        print(f"[DEBUG] OpenAI call failed: {e}")
        # fallback: if qa_count exceeds domain questions, mark done
        count = len(prev_qas)
        if count >= (len(domain_qs or DEFAULT_QUESTIONS) or 6):
            return NextQuestionResponse(next_question=None, done=True)
        nq = (domain_qs or DEFAULT_QUESTIONS)[count % len(domain_qs or DEFAULT_QUESTIONS)]
        print(f"[DEBUG] Fallback question: {nq}")
        return NextQuestionResponse(next_question=nq, done=False)

    next_q = gen.get("next_question")
    done = bool(gen.get("done", False))

    # if done, mark in DB
    if done:
        try:
            col = db.get_db()["sessions"]
            await col.update_one({"session_id": session_id}, {"$set": {"done": True}})
        except Exception:
            pass

    print(f"[TIMER] /answer completed ({time.time() - t_start:.2f}s)")
    return {"next_question": next_q, "done": done, "user_answer": answer_text}


@router.post("/transcribe")
async def transcribe_endpoint(audio: UploadFile = File(...)):
    """Transcribe a single uploaded audio file and return the transcription.
    This is used by the frontend to immediately show editable text after recording.
    """
    t_start = time.time()
    print(f"[TIMER] /transcribe started")
    
    if not audio:
        raise HTTPException(status_code=400, detail="audio file required")
    temp_file_path = None
    try:
        suffix = os.path.splitext(audio.filename)[1] or '.wav'
        fd, temp_file_path = tempfile.mkstemp(suffix=suffix)
        with open(fd, 'wb') as f:
            content = await audio.read()
            f.write(content)
        
        print(f"[TIMER] /transcribe file written ({time.time() - t_start:.2f}s)")
        
        # transcribe
        try:
            t_whisper = time.time()
            text = await transcribe_audio_file(temp_file_path)
            print(f"[TIMER] /transcribe Whisper API ({time.time() - t_whisper:.2f}s)")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Transcription failed: {e}")
        
        print(f"[TIMER] /transcribe completed ({time.time() - t_start:.2f}s)")
        return {"transcription": text}
    finally:
        try:
            if temp_file_path and os.path.exists(temp_file_path):
                os.remove(temp_file_path)
        except Exception:
            pass

@router.get("/sessions/{session_id}")
async def get_session(session_id: str):
    # try DB first
    try:
        col = db.get_db()["sessions"]
        doc = await col.find_one({"session_id": session_id})
        if not doc:
            raise HTTPException(status_code=404, detail="session not found")
        # convert _id to string
        if "_id" in doc:
            doc["id"] = str(doc["_id"])
            del doc["_id"]
        return doc
    except HTTPException:
        raise
    except Exception:
        # fallback to in-memory
        if session_id not in _sessions:
            raise HTTPException(status_code=404, detail="session not found")
        return _sessions[session_id]

@router.get("/tts")
async def tts(text: str):
    if not text:
        raise HTTPException(status_code=400, detail="text query param required")
    data = await text_to_speech_bytes(text)
    return StreamingResponse(iter([data]), media_type="audio/wav")
