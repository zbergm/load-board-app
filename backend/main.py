"""FastAPI application entry point for Load Board."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import CORS_ORIGINS
from database import init_database
from routers import inbound, outbound, reference, dashboard, sync

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


@app.get("/")
async def root():
    """Root endpoint - health check."""
    return {"status": "ok", "message": "Load Board API is running"}


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
