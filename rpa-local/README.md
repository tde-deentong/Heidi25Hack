# rpa-local — Desktop RPA GUI (Windows)

Small standalone Python GUI for running desktop RPA against a native Windows EHR application. It uses `pyautogui` to capture the screen and interact with the UI and `paddleocr` to extract text from screenshots. The program accepts a short input prompt describing the patient's recent issue, searches the visible EHR UI for related text and common fields, and returns the collected information as JSON.

Important notes
- This app must run on the Windows machine where the EHR GUI is visible and where you can allow screen capture and mouse control. Do NOT run this in headless containers.
- PaddleOCR requires `paddlepaddle` (a platform-specific binary). Install `paddlepaddle` first following instructions on https://www.paddlepaddle.org.cn/ then install other packages.

Example Windows install (PowerShell):
```powershell
# create and activate venv
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install paddlepaddle CPU wheel first (follow paddlepaddle docs for correct URL/version)
pip install paddlepaddle -f https://www.paddlepaddle.org.cn/whl/windows/mkl/avx/stable.html

# then install requirements
pip install -r requirements.txt
```

Run
```powershell
# Helper scripts
# Create venv and install deps (attempts paddlepaddle install):
.\setup_venv.ps1

# Run the app (activates venv then runs):
.\run_app.ps1
```

Usage
- Enter a short prompt describing the issue (e.g., "recent chest pain and shortness of breath").
- Click "Run RPA" — the app will OCR the visible desktop and look for relevant matches and common EHR fields.
- Results are shown as JSON in the GUI and can be saved to a file.

Security & Safety
- The app controls the mouse/keyboard and captures the screen. Only run it in trusted environments and be careful when interacting with production systems.

## Troubleshooting

- If you see an error mentioning "PyAutoGUI was unable to import pyscreeze" or a screenshot failure, install or upgrade the screenshot helper packages inside the virtualenv:

```powershell
. .\.venv\Scripts\Activate.ps1
pip install --upgrade Pillow pyscreeze pyautogui
```

- If PaddleOCR fails during first-run, the app may be downloading model files — wait for the download to finish or pre-warm OCR using the "Pre-warm OCR" button.