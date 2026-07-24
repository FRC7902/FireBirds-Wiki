from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any
from backend.services.markdown_loader import MarkdownLoader


router = APIRouter(prefix="/api/documents", tags=["documents"])
loader = MarkdownLoader()


@router.get("/all")
async def get_all_documents() -> List[Dict[str, Any]]:
    """Get all markdown documents."""
    files = loader.get_all_files()
    return files


@router.get("/{path:path}")
async def get_document(path: str) -> Dict[str, Any]:
    """
    Get a specific document by path.
    
    Args:
        path: File path relative to content directory (e.g., "01 — Engineering/CAD/CAD.md")
    
    Returns:
        Document data with metadata and content
    """
    # Ensure path ends with .md if it doesn't already
    if not path.endswith('.md'):
        path += '.md'
    
    file_data = loader.load_file(path)
    
    if not file_data:
        raise HTTPException(status_code=404, detail=f"Document not found: {path}")
    
    return file_data


@router.get("/search")
async def search_documents(q: str = Query(..., min_length=1)) -> List[Dict[str, Any]]:
    """
    Search documents by title or content.
    
    Args:
        q: Search query
    
    Returns:
        List of matching documents
    """
    results = loader.search_files(q)
    return results
