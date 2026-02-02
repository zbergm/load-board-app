"""Configuration settings for the Load Board application."""

import os
from pathlib import Path

# Base paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATABASE_PATH = BASE_DIR / "data" / "loadboard.db"

# Excel file path
EXCEL_FILE_PATH = Path(r"C:\Users\Zach\OneDrive - Ellingson Classic Cars\Desktop\Operations Data\Load Board 2026.xlsx")

# Backup directory for Excel files
BACKUP_DIR = BASE_DIR / "backups"

# Ensure directories exist
DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
BACKUP_DIR.mkdir(parents=True, exist_ok=True)

# API settings
API_HOST = "0.0.0.0"
API_PORT = 8000

# CORS settings
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]

# Sync settings
AUTO_SYNC_INTERVAL_MINUTES = 15
