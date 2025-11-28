import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from . import db
from .routes import router as routes

app = FastAPI(title="Pre-screening Voice Assistant")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routes)

# Serve static files (index.html)
static_dir = Path(__file__).parent / "static"
if static_dir.exists():
    app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

@app.on_event("startup")
async def startup_event():
    # ensure DB client created
    client = db.get_client()
    try:
        # create indexes for sessions collection to speed lookups and ensure unique session_id
        db_instance = db.get_db()
        col = db_instance["sessions"]
        # session_id should be unique
        await col.create_index([("session_id", 1)], unique=True)
        # index created_at for range queries
        await col.create_index([("created_at", 1)])
    except Exception:
        # if DB isn't available at startup, we'll fallback at runtime
        pass

@app.on_event("shutdown")
async def shutdown_event():
    client = db.get_client()
    try:
        client.close()
    except Exception:
        pass

@app.get("/")
async def root():
    return {"status": "ok", "message": "Pre-screening Voice Assistant backend. Visit /static/index.html for the web interface."}

@app.get("/index.html")
async def index_redirect():
    """Redirect to static index.html"""
    from fastapi.responses import FileResponse
    static_dir = Path(__file__).parent / "static"
    index_path = static_dir / "index.html"
    if index_path.exists():
        return FileResponse(index_path)
    return {"error": "index.html not found"}
