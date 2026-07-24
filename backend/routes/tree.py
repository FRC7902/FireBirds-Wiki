from fastapi import APIRouter, HTTPException
from pathlib import Path
from backend.services.markdown_loader import MarkdownLoader
from typing import List, Dict, Any


router = APIRouter(prefix="/api/tree", tags=["tree"])
loader = MarkdownLoader()


@router.get("/")
async def get_tree() -> Dict[str, Any]:
    """Get the complete folder tree structure."""
    from backend.services.tree_builder import TreeBuilder
    
    builder = TreeBuilder()
    tree = builder.build_tree()
    return {"tree": tree}


@router.get("/siblings/{path:path}")
async def get_siblings(path: str) -> List[Dict[str, Any]]:
    """Get sibling files in the same directory."""
    from backend.services.tree_builder import TreeBuilder
    
    builder = TreeBuilder()
    siblings = builder.get_siblings(path)
    
    if not siblings:
        raise HTTPException(status_code=404, detail="Directory not found")
    
    return siblings
