import os
import frontmatter
from pathlib import Path
from typing import Dict, List, Optional, Any


def _resolve_content_dir(content_dir: Optional[str] = None) -> Path:
    """Resolve the wiki directory, preferring ./Wiki and falling back to ./wiki."""
    candidates = []
    if content_dir:
        candidates.append(Path(content_dir))
    candidates.extend([Path("Wiki"), Path("wiki")])
    for candidate in candidates:
        if candidate.exists():
            return candidate
    return Path(content_dir or "Wiki")


class MarkdownLoader:
    """Loads and parses markdown files from the wiki directory."""

    def __init__(self, content_dir: str = "wiki"):
        self.content_dir = _resolve_content_dir(content_dir)

    def load_file(self, relative_path: str) -> Optional[Dict[str, Any]]:
        """
        Load a markdown file and return its frontmatter and content.
        
        Args:
            relative_path: Path relative to content directory (e.g., "01 — Engineering/CAD/CAD.md")
        
        Returns:
            Dict with 'metadata' and 'content' keys, or None if not found
        """
        file_path = self.content_dir / relative_path
        
        if not file_path.exists():
            return None

        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                post = frontmatter.load(f)
            
            return {
                'path': relative_path,
                'metadata': post.metadata,
                'content': post.content,
                'title': post.metadata.get('title', file_path.stem)
            }
        except Exception as e:
            print(f"Error loading file {relative_path}: {e}")
            return None

    def get_all_files(self) -> List[Dict[str, Any]]:
        """Get all markdown files in the content directory."""
        files = []
        
        for md_file in self.content_dir.rglob("*.md"):
            relative_path = md_file.relative_to(self.content_dir)
            file_data = self.load_file(str(relative_path))
            if file_data:
                files.append(file_data)
        
        return files

    def search_files(self, query: str) -> List[Dict[str, Any]]:
        """Search files by title or content."""
        query_lower = query.lower()
        results = []
        
        for file_data in self.get_all_files():
            title = file_data.get('title', '').lower()
            content = file_data.get('content', '').lower()
            
            if query_lower in title or query_lower in content:
                results.append(file_data)
        
        return results
