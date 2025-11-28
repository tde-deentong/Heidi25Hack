<#
.\setup_venv.ps1

Creates a Python virtual environment in `rpa-local\.venv`, activates it in the current PowerShell session, and installs required packages.

Note: PaddlePaddle often requires a platform-specific wheel. This script will attempt to install a CPU wheel from the PaddlePaddle Windows index; if you need a different build (GPU/CUDA), please follow the official instructions at https://www.paddlepaddle.org.cn/.
#>

param(
    [string]$PythonExe = '',
    [switch]$SkipPaddle = $false
)

function Test-PythonCmd {
    param([string]$Cmd)
    # Returns $true if the command runs and returns a Python version string
    try {
        $parts = $Cmd -split ' '\n        $exe = $parts[0]
        $args = @()
        if ($parts.Count -gt 1) { $args += $parts[1..($parts.Count-1)] }
        $args += @('-c', "import sys; print(sys.version)")
        $output = & $exe @args 2>&1
        if ($LASTEXITCODE -eq 0 -or $output) {
            return $true
        }
    } catch {
        return $false
    }
    return $false
}

function Find-Python311 {
    # Try py -3.11 first
    Write-Host "Looking for Python 3.11..."
    if (Test-PythonCmd 'py -3.11') {
        Write-Host "Found 'py -3.11' launcher"
        return 'py -3.11'
    }

    # Search PATH for python executables and check their versions
    $candidates = @()
    try {
        $cmds = Get-Command -All python, python3 -ErrorAction SilentlyContinue | Select-Object -Unique -ExpandProperty Source
        foreach ($c in $cmds) { if ($c) { $candidates += $c } }
    } catch {
        # fallback to where.exe
        $where = & where.exe python 2>$null
        if ($where) { $candidates += $where -split "\r?\n" }
    }

    # Add common install locations on Windows
    $common = @(
        "$env:LocalAppData\Programs\Python\Python311\python.exe",
        "C:\\Program Files\\Python311\\python.exe",
        "C:\\Program Files (x86)\\Python311\\python.exe"
    )
    foreach ($p in $common) { if (Test-Path $p) { $candidates += $p } }

    $candidates = $candidates | Select-Object -Unique
    foreach ($exe in $candidates) {
        try {
            $out = & $exe -c "import sys; print(sys.version)" 2>&1
            if ($out -match '^3\.11') {
                Write-Host "Found Python 3.11 at: $exe"
                return $exe
            }
        } catch {
            # ignore
        }
    }

    return $null
}

if (-not $PythonExe) {
    $found = Find-Python311
    if ($found) { $PythonExe = $found } else {
        Write-Error "Python 3.11 was not found on this system.\nInstall Python 3.11 (https://www.python.org/downloads/release/python-311x/) or use the Microsoft 'py' launcher to register 3.11.\nExample (winget): `winget install --id=Python.Python.3.11 -e`\nAfter installing, re-run this script."
        exit 1
    }
}

Write-Host "Creating virtual environment in .\.venv using: $PythonExe"
$createCmd = "$PythonExe -m venv .venv"
Write-Host "Running: $createCmd"
try {
    Invoke-Expression $createCmd
} catch {
    Write-Warning "Initial venv creation raised an exception: $_"
}

# If the venv wasn't created (Activate script missing), try fallback python launcher versions
if (-not (Test-Path .\.venv\Scripts\Activate.ps1)) {
    Write-Warning "Requested Python ($PythonExe) did not create a valid venv. Attempting fallbacks..."
    $tried = @()
    $preferred = @('py -3.11','py -3.10','py -3.9','py -3.8')
    foreach ($p in $preferred) {
        if ($p -eq $PythonExe) { continue }
        Write-Host "Testing $p..."
        if (Test-PythonCmd $p) {
            Write-Host "Found Python via: $p — creating venv with it"
            Invoke-Expression "$p -m venv .venv"
            if (Test-Path .\.venv\Scripts\Activate.ps1) { break }
        }
        $tried += $p
    }
    if (-not (Test-Path .\.venv\Scripts\Activate.ps1)) {
        Write-Host "No suitable py -3.x launcher found. Trying plain 'python' on PATH..."
        if (Test-PythonCmd 'python') {
            Invoke-Expression "python -m venv .venv"
        }
    }

    if (-not (Test-Path .\.venv\Scripts\Activate.ps1)) {
        Write-Error "Failed to create a virtual environment with Python 3.11/3.10/3.9/3.8 or 'python' on PATH.\nRun 'py -0p' to list installed Python versions or install Python 3.11 and retry."
        exit 1
    }
}

Write-Host "Activating virtual environment"
# Activate in this script/session
. .\.venv\Scripts\Activate.ps1

Write-Host "Upgrading pip"
python -m pip install --upgrade pip

Write-Host "Ensuring screenshot-related packages (Pillow, pyscreeze, pyautogui) are installed/upgraded"
python -m pip install --upgrade Pillow pyscreeze pyautogui

if (-not $SkipPaddle) {
    Write-Host "Installing PaddlePaddle CPU wheel (this may take a while). If you need GPU/CUDA support, follow the instructions at https://www.paddlepaddle.org.cn/"
    try {
        # prefer python -m pip to ensure we're using venv pip
        python -m pip install paddlepaddle -f https://www.paddlepaddle.org.cn/whl/windows/mkl/avx/stable.html
    } catch {
        Write-Warning "Automatic paddlepaddle install failed. Please install paddlepaddle manually per https://www.paddlepaddle.org.cn/ and re-run this script with -SkipPaddle if you already installed it. Error: $_"
    }
} else {
    Write-Host "Skipping automatic paddlepaddle installation (assume user installed it manually)."
}

Write-Host "Installing python requirements"
python -m pip install -r requirements.txt

Write-Host "Setup complete. To run the app in this session, you can now run: . .\\.venv\\Scripts\\Activate.ps1 ; python app.py"
