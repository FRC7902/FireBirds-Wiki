from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from backend.routes import tree, documents
import os
from pathlib import Path


app = FastAPI(
    title="7902 Wiki API",
    description="Backend API for the Markham FireBirds Wiki",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(tree.router)
app.include_router(documents.router)

# PDF files synced from Drive live under Wiki/_assets and are served to the
# browser's built-in PDF viewer at /media/.
WIKI_DIR = Path(__file__).resolve().parents[1] / "Wiki"
WIKI_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/media", StaticFiles(directory=str(WIKI_DIR)), name="media")


@app.get("/")
async def root():
    """Health check endpoint."""
    return {"message": "7902 Wiki API is running"}


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=port,
        reload=True
    )
