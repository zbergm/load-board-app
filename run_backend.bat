@echo off
cd /d C:\Users\Zach\load-board-app\backend
call venv\Scripts\activate
python -m uvicorn main:app --reload --port 8000
