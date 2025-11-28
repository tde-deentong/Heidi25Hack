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
    db.get_client()

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
