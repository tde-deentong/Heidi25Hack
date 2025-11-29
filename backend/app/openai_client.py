import os
import json
import tempfile
import asyncio
from typing import List, Dict
from dotenv import load_dotenv
import openai

# Load environment variables from .env file
load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if OPENAI_API_KEY:
    openai.api_key = OPENAI_API_KEY
else:
    raise ValueError("OPENAI_API_KEY environment variable is not set. Please set it in .env or export it.")

# Simple helper wrappers. These call blocking openai functions inside to_thread so endpoints stay async.

async def transcribe_audio_file(file_path: str) -> str:
    """Transcribe an audio file using OpenAI Whisper (whisper-1). Returns the transcribed text."""
    def _transcribe():
        # Uses the OpenAI python client sync method
        with open(file_path, "rb") as f:
            # model name may change; use "whisper-1" or the model you have access to
            resp = openai.Audio.transcribe("whisper-1", f)
            return resp.get("text", "")

    return await asyncio.to_thread(_transcribe)

async def generate_next_question(prev_qas: List[Dict], domain_questions: List[str] | None = None) -> Dict:
    """Ask the model to return the next question in JSON: {next_question: str|null, done: bool}

    prev_qas: list of {question,answer,timestamp}
    domain_questions: optional list of seed questions to prefer
    """
    # Sanitize prev_qas: convert datetime objects to ISO strings for JSON serialization
    sanitized_qas = []
    for qa in prev_qas:
        sanitized_qa = {
            "question": qa.get("question", ""),
            "answer": qa.get("answer", ""),
        }
        # Convert timestamp to ISO string if present
        if "timestamp" in qa and hasattr(qa["timestamp"], "isoformat"):
            sanitized_qa["timestamp"] = qa["timestamp"].isoformat()
        sanitized_qas.append(sanitized_qa)
    
    system_prompt = (
        "You are a medical pre-screening assistant. Your goal is to determine which medical specialty "
        "the patient needs (dentistry or cardiac) as QUICKLY as possible.\n\n"
        "Instructions:\n"
        "1. Listen to the patient's answer about their symptoms.\n"
        "2. If you can CONFIDENTLY determine the form type from their answer, END THE SESSION IMMEDIATELY.\n"
        "3. If you are UNSURE, ask ONE follow-up question to clarify.\n"
        "4. Dental-related symptoms (tooth pain, mouth, gums, braces, fillings, sensitivity, etc.) → form_type='dentistry'.\n"
        "5. Cardiac-related symptoms (chest pain, heart, shortness of breath, palpitations, etc.) → form_type='cardiac'.\n"
        "6. Be brief and friendly.\n\n"
        "Return ONLY a JSON object with keys: \"next_question\" (string or null), \"done\" (boolean), and \"form_type\" (string or null).\n"
        "- form_type: \"dentistry\", \"cardiac\", or null\n"
        "- next_question: null only when done=true\n"
        "- done: true when you have determined the form_type with confidence"
    )

    # Construct a short context with conversation history
    context = {
        "total_questions_asked": len(sanitized_qas),
        "recent_exchanges": sanitized_qas[-4:],  # last 4 exchanges only
    }

    user_prompt = (
        "Based on the patient's responses below, decide whether you can confidently determine the form type:\n\n"
        f"Context: {json.dumps(context, ensure_ascii=False)}\n\n"
        "DECISION RULES:\n"
        "- If the patient's answer clearly indicates DENTAL symptoms → form_type='dentistry', done=true (END IMMEDIATELY)\n"
        "- If the patient's answer clearly indicates CARDIAC symptoms → form_type='cardiac', done=true (END IMMEDIATELY)\n"
        "- If you are UNSURE after any number of questions → Ask ONE clarifying follow-up question, done=false\n"
        "- After asking at least one follow-up, if still unclear → Make your best judgment, set done=true with a form_type\n\n"
        "Dental keywords: tooth, teeth, mouth, gums, dental work, sensitivity, bite pain, filling, crown, extraction\n"
        "Cardiac keywords: chest, heart, breathless, palpitations, dizzy, fainting, arrhythmia\n\n"
        "Respond with ONLY valid JSON: {\"next_question\": \"your question\" OR null, \"done\": true OR false, \"form_type\": \"dentistry\" OR \"cardiac\" OR null}"
    )

    # Log what is being sent to the LLM
    print("[LLM INPUT] System prompt:\n", system_prompt)
    print("[LLM INPUT] User prompt:\n", user_prompt)
    print("[LLM INPUT] Context:", json.dumps(context, ensure_ascii=False))

    def _call():
        completion = openai.ChatCompletion.create(
            model="gpt-4o-mini", # fallback, replace with an available model if needed
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.2,
            max_tokens=200,
        )
        text = completion.choices[0].message.content.strip()
        # Try to parse JSON from the response
        try:
            parsed = json.loads(text)
            return parsed
        except Exception:
            # As a fallback, try to extract JSON-like content
            # naive approach: find first { and last }
            start = text.find("{")
            end = text.rfind("}")
            if start != -1 and end != -1:
                try:
                    return json.loads(text[start:end+1])
                except Exception:
                    pass
        # fallback default
        return {"next_question": None, "done": True}

    return await asyncio.to_thread(_call)

async def generate_followup_question(prev_qas: List[Dict], form_data: Dict, max_questions: int = 5) -> Dict:
    """Ask the model to return a relevant follow-up question in JSON: {next_question: str|null, done: bool}

    prev_qas: list of {question,answer,timestamp} from both purpose visit and follow-up
    form_data: dict of written form answers
    max_questions: maximum number of follow-up questions to ask
    """
    # Sanitize prev_qas: convert datetime objects to ISO strings for JSON serialization
    sanitized_qas = []
    for qa in prev_qas:
        sanitized_qa = {
            "question": qa.get("question", ""),
            "answer": qa.get("answer", ""),
        }
        if "timestamp" in qa and hasattr(qa["timestamp"], "isoformat"):
            sanitized_qa["timestamp"] = qa["timestamp"].isoformat()
        sanitized_qas.append(sanitized_qa)

    # Only ask up to max_questions follow-ups
    followup_count = len(sanitized_qas)
    if followup_count >= max_questions:
        return {"next_question": None, "done": True}

    system_prompt = (
        "You are a medical assistant helping a clinician gather additional relevant information from a patient. "
        "You have access to the patient's initial visit purpose conversation and their written form responses. "
        "Your goal is to ask up to 5 additional, highly relevant follow-up questions to clarify or expand on their situation. "
        "Do NOT try to determine the form type or end the session early. "
        "Do NOT ask about information already clearly answered. "
        "Ask one clear, specific, and contextually relevant question at a time. "
        "When you have asked 5 follow-ups, or there is nothing more useful to ask, set done=true."
    )

    context = {
        "total_questions_asked": followup_count,
        "recent_exchanges": sanitized_qas[-4:],
        "form_data": form_data,
    }

    user_prompt = (
        "Here is the patient's context for follow-up questions.\n\n"
        f"Context: {json.dumps(context, ensure_ascii=False)}\n\n"
        "Ask ONE additional, highly relevant follow-up question. "
        "If there is nothing more useful to ask, set next_question to null and done to true.\n\n"
        "Respond with ONLY valid JSON: {\"next_question\": \"your question\" OR null, \"done\": true OR false}"
    )

    print("[LLM INPUT] System prompt (followup):\n", system_prompt)
    print("[LLM INPUT] User prompt (followup):\n", user_prompt)
    print("[LLM INPUT] Context (followup):", json.dumps(context, ensure_ascii=False))

    def _call():
        completion = openai.ChatCompletion.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.3,
            max_tokens=200,
        )
        text = completion.choices[0].message.content.strip()
        try:
            parsed = json.loads(text)
            return parsed
        except Exception:
            start = text.find("{")
            end = text.rfind("}")
            if start != -1 and end != -1:
                try:
                    return json.loads(text[start:end+1])
                except Exception:
                    pass
        return {"next_question": None, "done": True}

    return await asyncio.to_thread(_call)
