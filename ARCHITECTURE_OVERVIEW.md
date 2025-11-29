# Heidi25Hack System Architecture Overview

## High-Level Architecture

- **Frontend (React + Vite)**
  - User interface for patient pre-screening, forms, and follow-up
  - Voice recording, transcription, and TTS playback
  - Communicates with backend via REST API

- **Backend (FastAPI, Python)**
  - REST API for session management, question/answer flow, transcription, and TTS
  - Integrates with OpenAI GPT-4o-mini for LLM-driven question generation and context extraction
  - Uses Whisper API for audio transcription
  - MongoDB for session and questionnaire data persistence

- **LLM Integration**
  - Purpose Visit: LLM determines form type (dentistry/cardiac) and controls question flow
  - Additional Details: LLM generates contextual follow-up questions using both voice and form data

- **Containerization**
  - Docker Compose for orchestrating backend, frontend, and MongoDB services

## Key Tools & Technologies

- **Frontend:** React, Vite, Tailwind CSS, Lucide Icons
- **Backend:** FastAPI, OpenAI API (GPT-4o-mini, Whisper), Python, Motor (async MongoDB)
- **Database:** MongoDB
- **DevOps:** Docker, Docker Compose
- **Other:** dotenv, FormData API, browser SpeechSynthesis

---
This document provides a concise, high-level summary of the system's architecture and main technologies used.
