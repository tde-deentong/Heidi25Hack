"""rpa-local GUI

Simple tkinter GUI that accepts a prompt, runs desktop OCR+RPA using pyautogui + PaddleOCR,
and shows/saves JSON results.
"""
import json
import logging
import os
import threading
import time
import traceback
import sys
import subprocess
from typing import List, Dict

try:
    import tkinter as tk
    from tkinter import scrolledtext, filedialog, messagebox
except Exception:
    raise

try:
    import pyautogui
except Exception:
    pyautogui = None

try:
    import pyscreeze
except Exception:
    pyscreeze = None

try:
    from paddleocr import PaddleOCR
except Exception:
    PaddleOCR = None

from PIL import Image
try:
    from PIL import ImageGrab
except Exception:
    ImageGrab = None
import numpy as np
import platform
try:
    from importlib import metadata as importlib_metadata
except Exception:
    try:
        import importlib_metadata as importlib_metadata
    except Exception:
        importlib_metadata = None

# --- logging setup -------------------------------------------------
LOG_PATH = os.path.join(os.path.dirname(__file__), 'rpa_local.log')
logger = logging.getLogger('rpa-local')
logger.setLevel(logging.INFO)
if not logger.handlers:
    fh = logging.FileHandler(LOG_PATH, encoding='utf-8')
    fh.setLevel(logging.INFO)
    fmt = logging.Formatter('%(asctime)s %(levelname)s: %(message)s')
    fh.setFormatter(fmt)
    logger.addHandler(fh)
    # also log to console
    ch = logging.StreamHandler()
    ch.setLevel(logging.INFO)
    ch.setFormatter(fmt)
    logger.addHandler(ch)

# --------------------------------------------------------------------


def init_ocr():
    if PaddleOCR is None:
        return None
    return PaddleOCR(use_angle_cls=True, lang='en')


# lazy init; call init_ocr() from a background thread to pre-warm
OCR = None


def screenshot():
    # Prefer pyscreeze screenshot functions if available
    if pyscreeze is not None:
        try:
            fn = getattr(pyscreeze, 'screenshot', None) or getattr(pyscreeze, 'grab', None) or getattr(pyscreeze, 'grab_screen', None)
            if fn is not None:
                return fn()
        except Exception:
            logger.exception('pyscreeze screenshot call failed, falling back')

    # Next try PIL.ImageGrab (works on Windows)
    if ImageGrab is not None:
        try:
            return ImageGrab.grab()
        except Exception:
            logger.exception('PIL.ImageGrab.grab() failed, falling back')

    # Last resort: pyautogui.screenshot() if available (avoid unless necessary)
    if pyautogui is not None:
        try:
            logger.info('Using pyautogui.screenshot() as fallback')
            return pyautogui.screenshot()
        except Exception:
            logger.exception('pyautogui.screenshot() failed')

    raise RuntimeError('No available screenshot method (pyscreeze, ImageGrab, or pyautogui)')


def screenshot_grab(bbox=None):
    """Return a PIL Image of the screen or region. bbox=(left, top, width, height).
    Uses pyscreeze if available, otherwise falls back to pyautogui screenshot and crop.
    """
    # Try pyscreeze grab with bbox support
    if pyscreeze is not None:
        try:
            if bbox is None:
                fn = getattr(pyscreeze, 'screenshot', None) or getattr(pyscreeze, 'grab', None)
                if fn is not None:
                    return fn()
                return pyscreeze.grab()
            # pyscreeze.grab accepts bbox=(left, top, width, height)
            return pyscreeze.grab(bbox=bbox)
        except Exception:
            logger.exception('pyscreeze.grab failed with bbox=%s', str(bbox))

    # Try PIL ImageGrab
    if ImageGrab is not None:
        try:
            if bbox is None:
                return ImageGrab.grab()
            left, top, w, h = bbox
            return ImageGrab.grab(bbox=(left, top, left + w, top + h))
        except Exception:
            logger.exception('ImageGrab.grab failed with bbox=%s', str(bbox))

    # Fallback: try pyautogui.screenshot and crop (use only if others fail)
    if pyautogui is not None:
        try:
            logger.info('Using pyautogui.screenshot() as final fallback for region')
            img = pyautogui.screenshot()
            if bbox is None:
                return img
            left, top, w, h = bbox
            return img.crop((left, top, left + w, top + h))
        except Exception:
            logger.exception('pyautogui.screenshot failed in screenshot_grab')

    raise RuntimeError('No available screenshot method')


def locate_on_screen(template_path: str, confidence: float = None):
    """Locate a template image on the screen. Returns Box-like object or None."""
    try:
        if pyscreeze is not None:
            if confidence is not None:
                return pyscreeze.locateOnScreen(template_path, confidence=confidence)
            return pyscreeze.locateOnScreen(template_path)
        if pyautogui is not None:
            if confidence is not None:
                return pyautogui.locateOnScreen(template_path, confidence=confidence)
            return pyautogui.locateOnScreen(template_path)
    except Exception:
        logger.exception('locate_on_screen failed for %s', template_path)
    return None


def locate_all_on_screen(template_path: str, confidence: float = None):
    try:
        if pyscreeze is not None:
            if confidence is not None:
                return list(pyscreeze.locateAllOnScreen(template_path, confidence=confidence))
            return list(pyscreeze.locateAllOnScreen(template_path))
        if pyautogui is not None:
            if confidence is not None:
                return list(pyautogui.locateAllOnScreen(template_path, confidence=confidence))
            return list(pyautogui.locateAllOnScreen(template_path))
    except Exception:
        logger.exception('locate_all_on_screen failed for %s', template_path)
    return []


def _box_to_rect(box):
    """Normalize box to (left, top, right, bottom). Handles several box formats."""
    try:
        # pyscreeze Box-like object
        if hasattr(box, 'left') and hasattr(box, 'top') and hasattr(box, 'width'):
            left = int(box.left)
            top = int(box.top)
            right = int(box.left + box.width)
            bottom = int(box.top + box.height)
            return left, top, right, bottom
    except Exception:
        pass

    if isinstance(box, (list, tuple)):
        if len(box) == 4:
            a, b, c, d = box
            # treat as (left, top, width, height)
            try:
                left = int(a)
                top = int(b)
                right = int(a + c)
                bottom = int(b + d)
                return left, top, right, bottom
            except Exception:
                pass
        # maybe PaddleOCR points
        try:
            xs = [int(p[0]) for p in box]
            ys = [int(p[1]) for p in box]
            return min(xs), min(ys), max(xs), max(ys)
        except Exception:
            pass

    return 0, 0, 0, 0


def get_box_center(box):
    left, top, right, bottom = _box_to_rect(box)
    return int((left + right) / 2), int((top + bottom) / 2)


def click_box_center(box, clicks: int = 1, interval: float = 0.1):
    if pyautogui is None:
        raise RuntimeError('pyautogui is not available for clicking')
    x, y = get_box_center(box)
    pyautogui.click(x=x, y=y, clicks=clicks, interval=interval)


def pil_to_cv(img: Image.Image):
    arr = np.array(img.convert('RGB'))
    return arr[:, :, ::-1]


def run_ocr_on_image(img: Image.Image):
    if OCR is None:
        raise RuntimeError("PaddleOCR not initialized. Pre-warm OCR first or wait for initialization to complete.")
    arr = pil_to_cv(img)
    raw = OCR.ocr(arr, det=True, rec=True, cls=True)
    parsed = []
    for item in raw:
        try:
            box = item[0]
            txt = item[1][0]
            score = float(item[1][1])
        except Exception:
            continue
        parsed.append({"text": txt, "box": box, "score": score})
    return parsed


COMMON_FIELDS = [
    "Name",
    "DOB",
    "Date of Birth",
    "Allergies",
    "Medications",
    "Meds",
    "Problem List",
    "Diagnoses",
    "Chief Complaint",
    "Vitals",
    "BP",
    "Pulse",
    "Temperature",
]


def extract_value_right_of_box(box, padding=6, width=450, height=80):
    img = screenshot()
    xs = [int(p[0]) for p in box]
    ys = [int(p[1]) for p in box]
    left = max(0, max(xs) + padding)
    top = max(0, min(ys) - padding)
    right = left + width
    bottom = top + height
    cropped = img.crop((left, top, right, bottom))
    try:
        lines = run_ocr_on_image(cropped)
        texts = [l.get('text') for l in lines if l.get('text')]
        return '\n'.join(texts).strip()
    except Exception:
        return ''


def find_text_on_screen_all():
    img = screenshot()
    return run_ocr_on_image(img)


def rpa_collect_for_prompt(prompt: str, additional_fields: List[str] = None) -> Dict:
    """Main RPA logic: OCR whole screen, match prompt words and common fields, extract nearby values."""
    if additional_fields is None:
        additional_fields = []
    keywords = [w.lower() for w in prompt.split() if len(w) > 3]
    keywords = [k for k in keywords if k not in ("patient", "having", "recent", "recently")]

    try:
        ocr_lines = find_text_on_screen_all()
    except Exception as e:
        logger.exception("OCR failed during rpa_collect_for_prompt")
        raise RuntimeError(f"OCR failed: {e}")

    result = {"timestamp": int(time.time()), "prompt": prompt, "fields": {}, "matches": []}

    # Search for common fields
    for fld in COMMON_FIELDS + additional_fields:
        matches = [l for l in ocr_lines if fld.lower() in (l.get('text') or '').lower()]
        if matches:
            entries = []
            for m in matches:
                val = extract_value_right_of_box(m.get('box'))
                entries.append({"label_text": m.get('text'), "score": m.get('score'), "value": val})
            result['fields'][fld] = {"found": True, "matches": entries}
        else:
            result['fields'][fld] = {"found": False, "matches": []}

    # Search for prompt-related text anywhere
    for l in ocr_lines:
        txt = (l.get('text') or '').lower()
        if any(k in txt for k in keywords):
            result['matches'].append({"text": l.get('text'), "score": l.get('score'), "box": l.get('box')})

    # Deduplicate matches
    # (basic) also attempt to expand matches by grabbing nearby right-hand text
    for m in list(result['matches']):
        try:
            val = extract_value_right_of_box(m.get('box'))
            m['extracted_value'] = val
        except Exception:
            m['extracted_value'] = ''

    return result


class RPAApp:
    def __init__(self, root):
        self.root = root
        root.title('rpa-local — Desktop RPA')

        frm = tk.Frame(root)
        frm.pack(padx=8, pady=8, fill='both', expand=True)

        tk.Label(frm, text='Describe issue / prompt:').pack(anchor='w')
        self.prompt_entry = tk.Entry(frm, width=80)
        self.prompt_entry.pack(fill='x')

        tk.Label(frm, text='(Optional) additional fields (comma-separated):').pack(anchor='w', pady=(6,0))
        self.fields_entry = tk.Entry(frm, width=80)
        self.fields_entry.pack(fill='x')

        btn_frame = tk.Frame(frm)
        btn_frame.pack(fill='x', pady=6)
        self.run_btn = tk.Button(btn_frame, text='Run RPA', command=self.on_run)
        self.run_btn.pack(side='left')
        self.prewarm_btn = tk.Button(btn_frame, text='Pre-warm OCR', command=self.on_prewarm)
        self.prewarm_btn.pack(side='left', padx=(6,0))
        self.save_btn = tk.Button(btn_frame, text='Save JSON', command=self.on_save, state='disabled')
        self.save_btn.pack(side='left', padx=(6,0))
        self.copy_btn = tk.Button(btn_frame, text='Copy JSON', command=self.on_copy, state='disabled')
        self.copy_btn.pack(side='left', padx=(6,0))

        self.status_label = tk.Label(frm, text='Ready')
        self.status_label.pack(anchor='w')

        tk.Label(frm, text='Result (JSON):').pack(anchor='w', pady=(6,0))
        self.result_text = scrolledtext.ScrolledText(frm, height=20)
        self.result_text.pack(fill='both', expand=True)

        self.result = None
        # Auto pre-warm OCR in background so first run is faster (may download models)
        self.root.after(200, lambda: threading.Thread(target=self._auto_prewarm, daemon=True).start())

    def _auto_prewarm(self):
        # don't block GUI; update status via root.after
        try:
            if OCR is not None:
                return
            logger.info('Auto pre-warm: initializing OCR in background')
            self.root.after(0, lambda: self.set_status('Initializing OCR (may download models)...'))
            self._do_prewarm()
            self.root.after(0, lambda: self.set_status('OCR ready'))
            logger.info('Auto pre-warm complete')
        except Exception:
            logger.exception('Auto pre-warm failed')
            self.root.after(0, lambda: self.set_status('OCR initialization failed (see log)'))

    def on_prewarm(self):
        self.prewarm_btn.config(state='disabled')
        self.set_status('Initializing OCR (may download models)...')
        threading.Thread(target=self._prewarm_worker, daemon=True).start()

    def _prewarm_worker(self):
        try:
            self._do_prewarm()
            self.root.after(0, lambda: self.set_status('OCR ready'))
            logger.info('User-initiated OCR prewarm complete')
        except Exception:
            logger.exception('User prewarm failed')
            self.root.after(0, lambda: self.set_status('OCR initialization failed (see log)'))
        finally:
            self.root.after(0, lambda: self.prewarm_btn.config(state='normal'))

    def _do_prewarm(self):
        global OCR
        if PaddleOCR is None:
            raise RuntimeError('PaddleOCR not installed')
        if OCR is None:
            logger.info('Initializing PaddleOCR (this may download model files)')
            OCR = init_ocr()
            logger.info('PaddleOCR initialized')

    def set_status(self, text):
        self.status_label.config(text=text)
        self.root.update_idletasks()

    def on_run(self):
        prompt = self.prompt_entry.get().strip()
        if not prompt:
            messagebox.showwarning('Input required', 'Enter a prompt describing the issue')
            return
        fields = [f.strip() for f in (self.fields_entry.get() or '').split(',') if f.strip()]
        # Confirm with the user because this will capture the screen and may control input
        confirmed = messagebox.askyesno('Confirm', 'This will capture the screen and may control the mouse/keyboard. Proceed?')
        if not confirmed:
            return

        # start a small countdown to give user time to prepare
        self.result_text.delete('1.0', tk.END)
        self.start_countdown(5, prompt, fields)

    def start_countdown(self, seconds: int, prompt: str, fields: List[str]):
        def tick(n):
            if n <= 0:
                self.set_status('Starting RPA...')
                self._start_worker_thread(prompt, fields)
                return
            self.set_status(f'Starting in {n}... (move EHR window into place)')
            self.root.after(1000, lambda: tick(n-1))

        # disable the run button during the countdown
        self.run_btn.config(state='disabled')
        tick(seconds)

    def _start_worker_thread(self, prompt: str, fields: List[str]):
        def worker():
            try:
                logger.info('RPA run started')
                res = rpa_collect_for_prompt(prompt, additional_fields=fields)
                self.result = res
                logger.info('RPA run completed')
                self.root.after(0, self.show_result)
            except Exception as ex:
                logger.exception('RPA worker error')
                tb = traceback.format_exc()
                self.root.after(0, (lambda exc=ex, tb_str=tb: messagebox.showerror('RPA error', f'{exc}\n\n{tb_str}')))
            finally:
                self.root.after(0, lambda: self.run_btn.config(state='normal'))
                self.root.after(0, lambda: self.set_status('Idle'))

        t = threading.Thread(target=worker, daemon=True)
        t.start()

    def show_result(self):
        txt = json.dumps(self.result, indent=2, ensure_ascii=False)
        self.result_text.insert('1.0', txt)
        self.save_btn.config(state='normal')
        self.copy_btn.config(state='normal')

    def on_save(self):
        if not self.result:
            return
        f = filedialog.asksaveasfilename(defaultextension='.json', filetypes=[('JSON','*.json')])
        if not f:
            return
        with open(f, 'w', encoding='utf-8') as fh:
            json.dump(self.result, fh, indent=2, ensure_ascii=False)
        messagebox.showinfo('Saved', f'Saved results to {f}')

    def on_copy(self):
        if not self.result:
            return
        self.root.clipboard_clear()
        self.root.clipboard_append(json.dumps(self.result, ensure_ascii=False))
        messagebox.showinfo('Copied', 'JSON copied to clipboard')


def main():
    root = tk.Tk()
    app = RPAApp(root)
    root.mainloop()


if __name__ == '__main__':
    main()
