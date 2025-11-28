import uuid
import os
import tempfile
import shutil
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse
from typing import Optional
import asyncio
import json

from .schemas import StartSessionRequest, StartSessionResponse, AnswerRequest, QAItem, NextQuestionResponse
from .openai_client import transcribe_audio_file, generate_next_question
from .utils.tts import text_to_speech_bytes

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
    session_id = str(uuid.uuid4())
    first_question = (payload.domain_questions or DEFAULT_QUESTIONS)[0]
    doc = {
        "session_id": session_id,
        "patient_name": payload.patient_name,
        "qas": [],
    }
    _sessions[session_id] = doc
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
        # transcribe
        try:
            answer_text = await transcribe_audio_file(temp_file_path)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Transcription failed: {e}")
        finally:
            try:
                os.remove(temp_file_path)
            except Exception:
                pass

    # persist to in-memory store
    if session_id not in _sessions:
        raise HTTPException(status_code=404, detail="session not found")
    
    qa_item = {"question": question, "answer": answer_text}
    _sessions[session_id]["qas"].append(qa_item)
    prev_qas = _sessions[session_id]["qas"]

    # parse domain_questions if provided
    domain_qs = None
    if domain_questions:
        import json
        try:
            domain_qs = json.loads(domain_questions)
        except Exception:
            domain_qs = None

    # ask OpenAI for next question
    try:
        gen = await generate_next_question(prev_qas, domain_qs or DEFAULT_QUESTIONS)
    except Exception as e:
        # fallback simple logic: if more than 6 qas, done
        if len(prev_qas) >= 6:
            return NextQuestionResponse(next_question=None, done=True)
        else:
            # ask the next default
            nq = DEFAULT_QUESTIONS[len(prev_qas) % len(DEFAULT_QUESTIONS)]
            return NextQuestionResponse(next_question=nq, done=False)

    next_q = gen.get("next_question")
    done = bool(gen.get("done", False))
    return {
        "next_question": next_q, 
        "done": done,
        "user_answer": answer_text
    }


@router.post("/transcribe")
async def transcribe_endpoint(audio: UploadFile = File(...)):
    """Transcribe a single uploaded audio file and return the transcription.
    This is used by the frontend to immediately show editable text after recording.
    """
    if not audio:
        raise HTTPException(status_code=400, detail="audio file required")
    temp_file_path = None
    try:
        suffix = os.path.splitext(audio.filename)[1] or '.wav'
        fd, temp_file_path = tempfile.mkstemp(suffix=suffix)
        with open(fd, 'wb') as f:
            content = await audio.read()
            f.write(content)
        # transcribe
        try:
            text = await transcribe_audio_file(temp_file_path)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Transcription failed: {e}")
        return {"transcription": text}
    finally:
        try:
            if temp_file_path and os.path.exists(temp_file_path):
                os.remove(temp_file_path)
        except Exception:
            pass

@router.get("/sessions/{session_id}")
async def get_session(session_id: str):
    if session_id not in _sessions:
        raise HTTPException(status_code=404, detail="session not found")
    return _sessions[session_id]

@router.get("/tts")
async def tts(text: str):
    if not text:
        raise HTTPException(status_code=400, detail="text query param required")
    data = await text_to_speech_bytes(text)
    return StreamingResponse(iter([data]), media_type="audio/wav")
