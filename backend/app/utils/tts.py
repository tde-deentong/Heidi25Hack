import tempfile
import asyncio
from pathlib import Path
import pyttsx3

async def text_to_speech_bytes(text: str, voice_rate: int = 150) -> bytes:
    """Render text to WAV bytes using pyttsx3 in a thread to avoid blocking.
    Returns bytes of a WAV file.
    """
    def _render(temp_path: str):
        engine = pyttsx3.init()
        engine.setProperty('rate', voice_rate)
        # Save to file
        engine.save_to_file(text, temp_path)
        engine.runAndWait()
        with open(temp_path, 'rb') as f:
            data = f.read()
        return data

    fd = tempfile.NamedTemporaryFile(suffix='.wav', delete=False)
    temp_path = fd.name
    fd.close()
    data = await asyncio.to_thread(_render, temp_path)
    # remove file
    try:
        Path(temp_path).unlink()
    except Exception:
        pass
    return data
