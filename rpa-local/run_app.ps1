<#
.\run_app.ps1

Activate the virtual environment and run the rpa-local GUI.
Usage: run from PowerShell in the rpa-local folder.
#>

param(
    [string]$PythonExe = 'py -3.11'
)

if (-Not (Test-Path .\.venv)) {
    Write-Host ".venv not found. Creating using $PythonExe..." -ForegroundColor Yellow
    # call setup_venv and pass the desired python
    & .\setup_venv.ps1 -PythonExe $PythonExe
}

Write-Host "Activating venv"
. .\.venv\Scripts\Activate.ps1

Write-Host "Running rpa-local GUI"
python app.py
