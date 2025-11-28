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

    prev_qas: list of {question,answer}
    domain_questions: optional list of seed questions to prefer
    """
    system_prompt = (
        "You are a medical pre-screening assistant whose job is to ask short relevant follow-up questions "
        "to collect useful information for a GP or specialist. Return ONLY a JSON object with keys: \"next_question\" "
        "(string or null) and \"done\" (boolean). If you determine you have enough information, respond with \"next_question\": null and \"done\": true."
    )

    # Construct a short context
    context = {
        "domain_questions": domain_questions or [],
        "previous_pairs": prev_qas[-8:],  # limit the context
    }

    user_prompt = (
        "Given the context JSON below, select or generate a single best next question to ask the patient. "
        "Questions should be short and aimed at clarifying or filling gaps. If no more questions are needed, set done=true and next_question=null.\n\n"
        f"Context: {json.dumps(context, ensure_ascii=False)}\n\n"
        "Answer in JSON only."
    )

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
