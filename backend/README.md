# Pre-screening Voice Assistant (FastAPI + MongoDB + OpenAI)

Minimal backend skeleton that:

- Accepts voice or text answers from patients.
- Uses OpenAI (Whisper) to transcribe audio and ChatCompletion to select/generate the next appropriate question.
- Stores question-answer pairs in MongoDB (JSON documents).
- Provides a simple TTS endpoint (optional, built with pyttsx3) to return audio for text.

## Requirements

- Python 3.10+
- MongoDB instance (local or cloud)
- An OpenAI API key

## Environment variables

Create a `.env` file or export these env vars:

- `OPENAI_API_KEY` - your OpenAI API key
- `MONGO_URI` - MongoDB connection URI (e.g. `mongodb://localhost:27017`)
- `HOST` (optional) - host to bind (default: 0.0.0.0)
- `PORT` (optional) - port to run uvicorn (default: 8000)

## Install

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Run dev server

```bash
export OPENAI_API_KEY="your-key"
export MONGO_URI="mongodb://localhost:27017"
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Endpoints (brief)

- `POST /start_session` -> create a session and get first question.
- `POST /answer` -> send an answer (text or audio multipart file); receives next question or done flag.
- `GET /sessions/{session_id}` -> retrieve stored Q/A pairs.
- `GET /tts?text=...` -> returns TTS audio (wav). Optional: frontend can handle TTS instead.

## Notes & next steps

- This is minimal; in production add authentication, rate limiting, robust error handling, streaming audio support, larger prompts management, and proper model/key management.
- For better TTS consider external services (Google Cloud TTS, Amazon Polly) or OpenAI TTS when available.

