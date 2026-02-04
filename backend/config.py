"""Configuration settings for the Load Board application."""

import os
from pathlib import Path

# Base paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATABASE_PATH = BASE_DIR / "data" / "loadboard.db"

# Excel file path - local file (used if SHAREPOINT_EXCEL_URL is not set)
EXCEL_FILE_PATH = Path(r"C:\Users\Zach\OneDrive - Ellingson Classic Cars\Desktop\Operations Data\Load Board 2026.xlsx")

# SharePoint/OneDrive Excel URL - set this to use cloud-hosted file
# This should be a sharing link to the Excel file
SHAREPOINT_EXCEL_URL = os.environ.get(
    "SHAREPOINT_EXCEL_URL",
    "https://ellingsonclassiccars-my.sharepoint.com/:x:/g/personal/zach_b_ellingsonmotorcars_com/IQCA6qYdYNn6TrW8Qt2YjHOwAZU_-KDN1Af6QsSF4HbFa_4?e=g6PSSD"
)

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
