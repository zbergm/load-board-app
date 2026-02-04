"""Excel sync endpoints."""

from datetime import datetime
from fastapi import APIRouter, HTTPException

from database import get_db
from models import SyncStatus, SyncResult
from services.excel_sync import ExcelSyncService

router = APIRouter()


@router.get("/status", response_model=SyncStatus)
async def get_sync_status():
    """Get the last sync status."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT sync_type, status, records_processed, timestamp
            FROM sync_log
            ORDER BY timestamp DESC
            LIMIT 1
        """)
        row = cursor.fetchone()

        if row:
            return SyncStatus(
                last_sync=row[3],
                sync_type=row[0],
                status=row[1],
                records_processed=row[2],
            )
        return SyncStatus()


@router.post("/import", response_model=SyncResult)
async def import_from_excel():
    """Import data from Excel file into the database."""
    try:
        service = ExcelSyncService()
        result = service.import_from_excel()
        return result
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Import failed: {str(e)}")


@router.post("/export", response_model=SyncResult)
async def export_to_excel():
    """Export database changes to the Excel file."""
    try:
        service = ExcelSyncService()
        result = service.export_to_excel()
        return result
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")


@router.get("/log")
async def get_sync_log(limit: int = 20):
    """Get recent sync log entries."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, sync_type, status, records_processed, timestamp, details
            FROM sync_log
            ORDER BY timestamp DESC
            LIMIT ?
        """, (limit,))
        rows = cursor.fetchall()

        return [
            {
                "id": row[0],
                "sync_type": row[1],
                "status": row[2],
                "records_processed": row[3],
                "timestamp": row[4],
                "details": row[5],
            }
            for row in rows
        ]


@router.get("/env-debug")
async def get_env_debug():
    """Debug endpoint to check environment variables."""
    import os

    # Get all env vars that start with GRAPH or are TEST_VAR
    graph_vars = {k: v[:10] + "..." if v else "(empty)" for k, v in os.environ.items() if k.startswith("GRAPH")}
    test_var = os.environ.get("TEST_VAR", "(not set)")

    # Count total env vars
    total_vars = len(os.environ)

    # Check for common Azure vars to confirm env vars work at all
    website_name = os.environ.get("WEBSITE_SITE_NAME", "(not set)")

    return {
        "total_env_vars": total_vars,
        "website_name": website_name,
        "test_var": test_var,
        "graph_vars_found": graph_vars,
        "all_var_names_with_graph": [k for k in os.environ.keys() if "GRAPH" in k.upper()],
    }


@router.get("/sharepoint-status")
async def get_sharepoint_status():
    """Check if SharePoint upload is configured."""
    import os
    from services.excel_sync import MSAL_AVAILABLE

    service = ExcelSyncService()
    is_configured = service.is_sharepoint_upload_configured()

    # Read directly from environment for debugging
    tenant_id = os.environ.get("GRAPH_TENANT_ID", "")
    client_id = os.environ.get("GRAPH_CLIENT_ID", "")
    client_secret = os.environ.get("GRAPH_CLIENT_SECRET", "")

    # Detailed status for debugging
    details = {
        "msal_available": MSAL_AVAILABLE,
        "has_tenant_id": bool(tenant_id),
        "has_client_id": bool(client_id),
        "has_client_secret": bool(client_secret),
        "has_file_path": bool(service.sharepoint_file_path),
        "has_user": bool(service.sharepoint_user),
        "file_path": service.sharepoint_file_path,
        "user": service.sharepoint_user,
        "tenant_id_preview": tenant_id[:8] + "..." if tenant_id else "(not set)",
        "client_id_preview": client_id[:8] + "..." if client_id else "(not set)",
    }

    return {
        "configured": is_configured,
        "message": "SharePoint upload is configured" if is_configured else "SharePoint upload not configured. Check details below.",
        "details": details
    }
