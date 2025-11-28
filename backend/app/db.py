import os
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    mongo_uri: str = os.getenv("MONGO_URI", "mongodb://localhost:27017/prescreener")

settings = Settings()

_client: AsyncIOMotorClient | None = None

def get_client() -> AsyncIOMotorClient:
    global _client
    if _client is None:
        _client = AsyncIOMotorClient(settings.mongo_uri)
    return _client

def get_db():
    client = get_client()
    # database name is included in the URI or fallback
    try:
        db = client.get_default_database()
        dbname = db.name if db is not None else "prescreener"
    except Exception:
        dbname = "prescreener"
    return client[dbname]
