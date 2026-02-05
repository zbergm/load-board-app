"""Configuration settings for the Load Board application."""

import os
from pathlib import Path

# Base paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATABASE_PATH = BASE_DIR / "data" / "loadboard.db"

# Excel file path - local file (used if SHAREPOINT_EXCEL_URL is not set)
# On Azure/Linux, this path won't exist - SharePoint will be the primary source
_local_excel_path = os.environ.get(
    "LOCAL_EXCEL_PATH",
    r"C:\Users\Zach\OneDrive - Ellingson Classic Cars\Desktop\Operations Data\Load Board 2026.xlsx"
)
EXCEL_FILE_PATH = Path(_local_excel_path) if os.name == 'nt' else Path("/nonexistent")

# SharePoint/OneDrive Excel URL - set this to use cloud-hosted file
# This should be a sharing link to the Excel file
SHAREPOINT_EXCEL_URL = os.environ.get(
    "SHAREPOINT_EXCEL_URL",
    "https://ellingsonclassiccars-my.sharepoint.com/:x:/g/personal/zach_b_ellingsonmotorcars_com/IQCA6qYdYNn6TrW8Qt2YjHOwAZU_-KDN1Af6QsSF4HbFa_4?e=g6PSSD"
)

# Microsoft Graph API settings for SharePoint upload
# To set up:
# 1. Go to Azure Portal > Azure Active Directory > App registrations
# 2. Create new registration (e.g., "Load Board App")
# 3. Add API permission: Microsoft Graph > Files.ReadWrite.All (Application)
# 4. Create a client secret under Certificates & secrets
# 5. Set the environment variables below
GRAPH_TENANT_ID = os.environ.get("GRAPH_TENANT_ID", "")
GRAPH_CLIENT_ID = os.environ.get("GRAPH_CLIENT_ID", "")
GRAPH_CLIENT_SECRET = os.environ.get("GRAPH_CLIENT_SECRET", "")

# OneDrive path for the Excel file (relative to user's OneDrive root)
# Example: "Desktop/Operations Data/Load Board 2026.xlsx"
SHAREPOINT_FILE_PATH = os.environ.get(
    "SHAREPOINT_FILE_PATH",
    "Documents/Desktop/Operations Data/Load Board 2026.xlsx"
)

# User principal name (email) for the OneDrive owner
SHAREPOINT_USER = os.environ.get(
    "SHAREPOINT_USER",
    "zach.b@ellingsonmotorcars.com"
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
