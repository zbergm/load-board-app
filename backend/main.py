"""FastAPI application entry point for Load Board."""

import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from config import CORS_ORIGINS
from database import init_database
from routers import inbound, outbound, reference, dashboard, sync

# Static files directory for frontend
STATIC_DIR = Path(__file__).parent / "static"

# Initialize the database
init_database()

# Create FastAPI app
app = FastAPI(
    title="Load Board API",
    description="API for managing the Load Board shipment tracking system",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(inbound.router, prefix="/api/inbound", tags=["Inbound Shipments"])
app.include_router(outbound.router, prefix="/api/outbound", tags=["Outbound Shipments"])
app.include_router(reference.router, prefix="/api/reference", tags=["Reference Data"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(sync.router, prefix="/api/sync", tags=["Excel Sync"])


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


# Serve static frontend files if they exist (for Azure deployment)
if STATIC_DIR.exists():
    app.mount("/assets", StaticFiles(directory=STATIC_DIR / "assets"), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        """Serve frontend for all non-API routes."""
        # Try to serve the requested file
        file_path = STATIC_DIR / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        # Fall back to index.html for SPA routing
        return FileResponse(STATIC_DIR / "index.html")
else:
    @app.get("/")
    async def root():
        """Root endpoint - health check (dev mode)."""
        return {"status": "ok", "message": "Load Board API is running. Frontend not built."}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
