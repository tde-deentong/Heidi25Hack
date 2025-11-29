from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime

class StartSessionRequest(BaseModel):
    patient_name: Optional[str] = None
    domain_questions: Optional[List[str]] = None

class StartSessionResponse(BaseModel):
    session_id: str
    first_question: str

class AnswerRequest(BaseModel):
    session_id: str
    question: str
    text: Optional[str] = None

class QAItem(BaseModel):
    question: str
    answer: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class NextQuestionResponse(BaseModel):
    next_question: Optional[str]
    done: bool = False
    form_type: Optional[str] = None

class SessionDoc(BaseModel):
    session_id: str
    patient_name: Optional[str]
    form_type: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    qas: List[QAItem] = []
