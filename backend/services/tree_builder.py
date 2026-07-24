import os
from pathlib import Path
from typing import Dict, List, Any


def _resolve_content_dir(content_dir: str = "Wiki") -> Path:
    """Resolve the wiki directory, preferring ./Wiki and falling back to ./wiki."""
    candidates = []
    if content_dir:
        candidates.append(Path(content_dir))
    candidates.extend([Path("Wiki"), Path("wiki")])
    for candidate in candidates:
        if candidate.exists():
            return candidate
    return Path(content_dir or "Wiki")


class TreeBuilder:
    """Builds a folder tree structure from the wiki directory."""

    def __init__(self, content_dir: str = "wiki"):
        self.content_dir = _resolve_content_dir(content_dir)

    def build_tree(self) -> Dict[str, Any]:
        """
        Build a complete folder tree structure.
        
        Returns:
            Dict representing the folder hierarchy
        """
        return self._build_node(self.content_dir, "Root")

    def _build_node(self, path: Path, name: str) -> Dict[str, Any]:
        """Build a node in the tree (directory or file)."""
        node = {
            "name": name,
            "type": "folder" if path.is_dir() else "file",
            "path": str(path.relative_to(self.content_dir)) if path != self.content_dir else "",
        }

        if path.is_dir():
            children = []
            try:
                for item in sorted(path.iterdir()):
                    if item.name.startswith('.') or item.name.startswith('_'):
                        continue
                    child_node = self._build_node(item, item.name)
                    children.append(child_node)
            except PermissionError:
                pass
            
            node["children"] = children
        else:
            # Extract metadata for files
            if path.suffix == ".md":
                try:
                    import frontmatter
                    with open(path, 'r', encoding='utf-8') as f:
                        post = frontmatter.load(f)
                    node["title"] = post.metadata.get("title", path.stem)
                    node["description"] = post.metadata.get("description", "")
                except Exception as e:
                    node["title"] = path.stem
                    node["description"] = ""

        return node

    def get_siblings(self, file_path: str) -> List[Dict[str, Any]]:
        """Get sibling files in the same directory."""
        target_path = self.content_dir / file_path
        parent_dir = target_path.parent

        siblings = []
        try:
            for item in sorted(parent_dir.iterdir()):
                if item.name.startswith('.'):
                    continue
                if item.is_file() and item.suffix == ".md":
                    relative_path = str(item.relative_to(self.content_dir))
                    siblings.append({
                        "name": item.stem,
                        "path": relative_path
                    })
        except PermissionError:
            pass

        return siblings
