"""Metadata management for tracking synchronized files."""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


class MetadataManager:
    """Manages metadata for synchronized files to enable efficient incremental updates."""

    def __init__(self, metadata_file: str = "metadata.json"):
        self.metadata_file = Path(metadata_file)
        self.data: dict[str, Any] = self._load()

    def _load(self) -> dict[str, Any]:
        """Load metadata from disk."""
        if self.metadata_file.exists():
            try:
                with open(self.metadata_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception:
                return self._create_empty()
        return self._create_empty()

    def _create_empty(self) -> dict[str, Any]:
        """Create empty metadata structure."""
        return {
            "lastSync": None,
            "files": {},
            "syncHistory": []
        }

    def save(self) -> None:
        """Save metadata to disk."""
        self.metadata_file.parent.mkdir(parents=True, exist_ok=True)
        with open(self.metadata_file, 'w', encoding='utf-8') as f:
            json.dump(self.data, f, indent=2)

    def get_last_sync(self) -> datetime | None:
        """Get the last synchronization timestamp."""
        last_sync = self.data.get("lastSync")
        if last_sync:
            return datetime.fromisoformat(last_sync.replace('Z', '+00:00'))
        return None

    def set_last_sync(self, timestamp: datetime | None = None) -> None:
        """Set the last synchronization timestamp."""
        if timestamp is None:
            timestamp = datetime.now(timezone.utc)
        self.data["lastSync"] = timestamp.isoformat().replace('+00:00', 'Z')

    def get_file_metadata(self, drive_id: str) -> dict[str, Any] | None:
        """Get metadata for a specific file by Drive ID."""
        return self.data.get("files", {}).get(drive_id)

    def update_file_metadata(
        self,
        drive_id: str,
        modified_time: str,
        path: str,
        local_path: str,
        text_content: str | None = None
    ) -> None:
        """Update metadata for a file."""
        if "files" not in self.data:
            self.data["files"] = {}
        
        file_meta = {
            "modified": modified_time,
            "path": path,
            "local": local_path
        }
        
        # Store extracted text for search indexing if provided
        if text_content is not None:
            file_meta["text"] = text_content
        
        self.data["files"][drive_id] = file_meta

    def remove_file_metadata(self, drive_id: str) -> None:
        """Remove metadata for a deleted file."""
        if "files" in self.data and drive_id in self.data["files"]:
            del self.data["files"][drive_id]

    def is_file_modified(self, drive_id: str, modified_time: str) -> bool:
        """Check if a file has been modified since last sync."""
        file_meta = self.get_file_metadata(drive_id)
        if not file_meta:
            return True  # New file
        
        return file_meta.get("modified") != modified_time

    def add_sync_history(
        self,
        status: str,
        new_files: int = 0,
        updated_files: int = 0,
        deleted_files: int = 0,
        skipped_files: int = 0,
        duration: float = 0.0,
        trigger: str = "manual"
    ) -> None:
        """Add a sync history entry."""
        if "syncHistory" not in self.data:
            self.data["syncHistory"] = []
        
        entry = {
            "timestamp": datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z'),
            "status": status,
            "new": new_files,
            "updated": updated_files,
            "deleted": deleted_files,
            "skipped": skipped_files,
            "duration": f"{duration:.1f}s",
            "trigger": trigger
        }
        
        self.data["syncHistory"].insert(0, entry)
        
        # Keep only last 20 entries
        self.data["syncHistory"] = self.data["syncHistory"][:20]

    def get_sync_history(self, limit: int = 20) -> list[dict[str, Any]]:
        """Get sync history."""
        return self.data.get("syncHistory", [])[:limit]

    def get_statistics(self) -> dict[str, int]:
        """Get current statistics."""
        return {
            "documents": len(self.data.get("files", {})),
            "folders": self._count_folders()
        }

    def _count_folders(self) -> int:
        """Count unique folders in file paths."""
        folders = set()
        for file_meta in self.data.get("files", {}).values():
            path = file_meta.get("path", "")
            if path:
                # Add all parent folders
                parts = Path(path).parts
                for i in range(len(parts)):
                    folders.add("/".join(parts[:i+1]))
        return len(folders)