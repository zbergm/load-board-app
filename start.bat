@echo off
title Load Board Application

echo ========================================
echo    Load Board Application Launcher
echo ========================================
echo.

:: Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://python.org
    pause
    exit /b 1
)

:: Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

cd /d "%~dp0"

:: Create virtual environment if it doesn't exist
if not exist "backend\venv" (
    echo Creating Python virtual environment...
    cd backend
    python -m venv venv
    cd ..
)

:: Install backend dependencies
echo Installing backend dependencies...
cd backend
call venv\Scripts\activate
pip install -r requirements.txt --quiet
cd ..

:: Install frontend dependencies if node_modules doesn't exist
if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
)

echo.
echo Starting servers...
echo ========================================
echo Backend API:  http://localhost:8000
echo Frontend UI:  http://localhost:5173
echo API Docs:     http://localhost:8000/docs
echo ========================================
echo.
echo Press Ctrl+C to stop all servers
echo.

:: Start backend in a new window
start "Load Board API" cmd /k "cd /d %~dp0backend && venv\Scripts\activate && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"

:: Wait a moment for backend to start
timeout /t 3 /nobreak >nul

:: Start frontend in a new window
start "Load Board UI" cmd /k "cd /d %~dp0frontend && npm run dev"

:: Wait a moment then open browser
timeout /t 5 /nobreak >nul
start http://localhost:5173

echo.
echo Application started! Browser should open automatically.
echo Close this window to continue using the application.
echo To stop the servers, close the API and UI windows.
pause
