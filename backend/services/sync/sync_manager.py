"""Core synchronization manager for Google Drive to local wiki sync."""

from __future__ import annotations

import os
import shutil
import time
from datetime import datetime, timezone
from pathlib import Path, PurePosixPath
from typing import Any, Callable, Optional

from .drive_client import DriveClient, safe_name
from .metadata import MetadataManager


class SyncManager:
    """Manages the synchronization between Google Drive and local wiki directory."""

    def __init__(
        self,
        drive_client: DriveClient | None = None,
        metadata_manager: MetadataManager | None = None,
        content_dir: str | None = None,
        progress_callback: Callable[[dict[str, Any]], None] | None = None
    ):
        self.drive_client = drive_client or DriveClient()
        self.metadata = metadata_manager or MetadataManager()
        
        # Resolve content directory
        if content_dir:
            self.content_dir = Path(content_dir)
        else:
            # Try to find Wiki directory
            root_dir = Path(__file__).resolve().parents[4]
            candidates = [root_dir / "Wiki", root_dir / "wiki", root_dir / "content"]
            for candidate in candidates:
                if candidate.exists():
                    self.content_dir = candidate
                    break
            else:
                self.content_dir = root_dir / "Wiki"
        
        self.content_dir.mkdir(parents=True, exist_ok=True)
        self.progress_callback = progress_callback

    def _update_progress(self, **kwargs: Any) -> None:
        """Update progress if callback is set."""
        if self.progress_callback:
            self.progress_callback(kwargs)

    def _format_searchable_text(self, text: str) -> str:
        """Format extracted text for inclusion in YAML frontmatter.
        
        Args:
            text: Raw extracted text from document
            
        Returns:
            Formatted text with proper indentation for YAML multiline string
        """
        if not text:
            return ""
        
        # Clean up the text
        lines = text.split('\n')
        
        # Remove excessive blank lines but preserve paragraph structure
        cleaned_lines = []
        prev_blank = False
        for line in lines:
            is_blank = not line.strip()
            if is_blank and prev_blank:
                continue  # Skip consecutive blank lines
            cleaned_lines.append(line)
            prev_blank = is_blank
        
        # Indent each line for YAML multiline string (4 spaces)
        # Keep blank lines as empty strings (no indentation needed)
        indented_lines = ['    ' + line if line.strip() else '' for line in cleaned_lines]
        
        return '\n'.join(indented_lines)

    def sync(self, trigger: str = "manual") -> dict[str, Any]:
        """
        Perform synchronization.
        
        Args:
            trigger: "manual" or "automatic"
        
        Returns:
            Dict with sync results
        """
        start_time = time.time()
        stats = {
            "new": 0,
            "updated": 0,
            "deleted": 0,
            "skipped": 0,
            "failed": 0
        }
        
        try:
            # Get all Drive files
            drive_files = self._get_all_drive_files()
            
            # Get all local files
            local_files = self._get_all_local_files()
            
            # Process Drive files
            for drive_file in drive_files:
                self._process_drive_file(drive_file, stats)
            
            # Remove deleted files
            self._remove_deleted_files(drive_files, local_files, stats)
            
            # Update metadata
            self.metadata.set_last_sync()
            self.metadata.save()
            
            duration = time.time() - start_time
            
            # Add to history
            self.metadata.add_sync_history(
                status="completed",
                new_files=stats["new"],
                updated_files=stats["updated"],
                deleted_files=stats["deleted"],
                skipped_files=stats["skipped"],
                duration=duration,
                trigger=trigger
            )
            self.metadata.save()
            
            return {
                "status": "completed",
                "new": stats["new"],
                "updated": stats["updated"],
                "deleted": stats["deleted"],
                "skipped": stats["skipped"],
                "failed": stats["failed"],
                "duration": f"{duration:.1f}s"
            }
        
        except Exception as e:
            duration = time.time() - start_time
            self.metadata.add_sync_history(
                status="failed",
                duration=duration,
                trigger=trigger
            )
            self.metadata.save()
            
            return {
                "status": "failed",
                "reason": str(e),
                "new": stats["new"],
                "updated": stats["updated"],
                "deleted": stats["deleted"],
                "skipped": stats["skipped"],
                "failed": stats["failed"],
                "duration": f"{duration:.1f}s"
            }

    def _get_all_drive_files(self) -> list[dict[str, Any]]:
        """Recursively get all files from Google Drive."""
        files = []
        visited_folders = set()
        
        def scan_folder(folder_id: str, relative_path: PurePosixPath) -> None:
            if folder_id in visited_folders:
                return
            visited_folders.add(folder_id)
            
            try:
                items = self.drive_client.get_folder_items(folder_id)
                self._update_progress(current=f"Scanning {relative_path}")
                
                for item in items:
                    mime_type = item.get("mimeType", "")
                    name = item["name"]
                    safe_filename = safe_name(name)
                    
                    if mime_type == "application/vnd.google-apps.folder":
                        # Recurse into subfolder
                        new_path = relative_path / safe_filename
                        scan_folder(item["id"], new_path)
                    else:
                        # It's a file
                        files.append({
                            "id": item["id"],
                            "name": name,
                            "safe_name": safe_filename,
                            "mime_type": mime_type,
                            "path": str(relative_path) if relative_path else "",
                            "relative_path": relative_path / safe_filename if relative_path else PurePosixPath(safe_filename)
                        })
            except Exception as e:
                print(f"Error scanning folder {folder_id}: {e}")
        
        # Start from root
        scan_folder(self.drive_client.folder_id, PurePosixPath())
        
        return files

    def _get_all_local_files(self) -> dict[str, Path]:
        """Get all local files indexed by their relative path."""
        local_files = {}
        
        for file_path in self.content_dir.rglob("*"):
            if file_path.is_file() and not file_path.name.startswith('.'):
                relative = file_path.relative_to(self.content_dir)
                local_files[str(relative)] = file_path
        
        return local_files

    def _process_drive_file(self, drive_file: dict[str, Any], stats: dict[str, int]) -> None:
        """Process a single Drive file."""
        try:
            drive_id = drive_file["id"]
            relative_path = drive_file["relative_path"]
            mime_type = drive_file["mime_type"]
            name = drive_file["name"]
            safe_filename = drive_file["safe_name"]
            
            # Determine local path
            if mime_type in ["application/vnd.google-apps.document", 
                            "application/vnd.google-apps.presentation",
                            "application/pdf"]:
                # These are converted to .md files
                local_path = self.content_dir / f"{relative_path}.md"
            elif name.lower().endswith('.md') or mime_type == 'text/markdown':
                local_path = self.content_dir / relative_path
            else:
                # Skip unsupported files
                stats["skipped"] += 1
                return
            
            # Check if file needs update
            file_meta = self.metadata.get_file_metadata(drive_id)
            
            # For now, we'll use a simple approach - check if file exists
            # In a real implementation, you'd check Drive's modifiedTime
            if file_meta and local_path.exists():
                # File exists and has metadata - skip for now
                # TODO: Implement proper modified time checking
                stats["skipped"] += 1
                return
            
            # Download and save file, get extracted text
            text_content = self._download_and_save(drive_file, local_path)
            
            # Update metadata with extracted text for search indexing
            self.metadata.update_file_metadata(
                drive_id=drive_id,
                modified_time=datetime.now(timezone.utc).isoformat(),
                path=str(drive_file["path"]),
                local_path=str(local_path.relative_to(self.content_dir)),
                text_content=text_content
            )
            
            if file_meta:
                stats["updated"] += 1
            else:
                stats["new"] += 1
            
            self._update_progress(
                current=f"{'Updated' if file_meta else 'Downloaded'} {relative_path}",
                progress=None
            )
        
        except Exception as e:
            print(f"Error processing file {drive_file.get('name', 'unknown')}: {e}")
            stats["failed"] += 1

    def _download_and_save(self, drive_file: dict[str, Any], local_path: Path) -> str | None:
        """Download a file from Drive and save it locally.
        
        Returns:
            Extracted text content for search indexing, or None if not applicable
        """
        drive_id = drive_file["id"]
        mime_type = drive_file["mime_type"]
        name = drive_file["name"]
        text_content = None
        
        # Create parent directories
        local_path.parent.mkdir(parents=True, exist_ok=True)
        
        if mime_type == "application/vnd.google-apps.document":
            # Download as PDF and extract text
            pdf_content = self.drive_client.download_google_doc_pdf(drive_id)
            text_content = self.drive_client.download_google_doc_text(drive_id)
            
            # Save PDF to Docusaurus static assets
            asset_name = f"{drive_id}.pdf"
            asset_path = Path("website/static/assets") / asset_name
            asset_path.parent.mkdir(parents=True, exist_ok=True)
            asset_path.write_bytes(pdf_content)
            
            # Save extracted text for search indexing
            text_asset_name = f"{drive_id}.txt"
            text_asset_path = Path("website/static/assets") / text_asset_name
            text_asset_path.write_text(text_content, encoding='utf-8')
            
            # Create Docusaurus-compatible markdown with PDF embed and search metadata
            # Include extracted text in frontmatter for search indexing
            content = f"""---
sidebar_label: "{name}"
title: "{name}"
searchable_text: |
{self._format_searchable_text(text_content)}
---

# {name}

This Google Doc is shown below.

import PdfEmbed from '@site/src/components/PdfEmbed';

<PdfEmbed src="/FireBirds-Wiki/assets/{asset_name}" title="{name}" />
"""
            local_path.write_text(content, encoding='utf-8')
        
        elif mime_type == "application/vnd.google-apps.presentation":
            # Download as PDF and extract text
            pdf_content = self.drive_client.download_google_slides_pdf(drive_id)
            text_content = self.drive_client.download_google_slides_text(drive_id)
            
            # Save PDF to Docusaurus static assets
            asset_name = f"{drive_id}.pdf"
            asset_path = Path("website/static/assets") / asset_name
            asset_path.parent.mkdir(parents=True, exist_ok=True)
            asset_path.write_bytes(pdf_content)
            
            # Save extracted text for search indexing
            text_asset_name = f"{drive_id}.txt"
            text_asset_path = Path("website/static/assets") / text_asset_name
            text_asset_path.write_text(text_content, encoding='utf-8')
            
            content = f"""---
sidebar_label: "{name}"
title: "{name}"
searchable_text: |
{self._format_searchable_text(text_content)}
---

# {name}

This Google Slides presentation is shown below.

import PdfEmbed from '@site/src/components/PdfEmbed';

<PdfEmbed src="/FireBirds-Wiki/assets/{asset_name}" title="{name}" />
"""
            local_path.write_text(content, encoding='utf-8')
        
        elif mime_type == "application/pdf" or name.lower().endswith('.pdf'):
            # Download PDF and create Docusaurus markdown wrapper
            pdf_content = self.drive_client.download_file(drive_id)
            asset_name = f"{drive_id}.pdf"
            asset_path = Path("website/static/assets") / asset_name
            asset_path.parent.mkdir(parents=True, exist_ok=True)
            asset_path.write_bytes(pdf_content)
            
            content = f"""---
sidebar_label: "{name}"
title: "{name}"
---

# {name}

This PDF is shown below.

import PdfEmbed from '@site/src/components/PdfEmbed';

<PdfEmbed src="/FireBirds-Wiki/assets/{asset_name}" title="{name}" />
"""
            local_path.write_text(content, encoding='utf-8')
        
        elif mime_type == "text/markdown" or name.lower().endswith('.md'):
            # Download markdown directly
            content = self.drive_client.download_file(drive_id)
            local_path.write_bytes(content)
            # For markdown files, use the content as searchable text
            text_content = content.decode('utf-8', errors='replace')
        
        else:
            # Unsupported file type
            print(f"Skipping unsupported file: {name} ({mime_type})")
        
        return text_content

    def _remove_deleted_files(
        self,
        drive_files: list[dict[str, Any]],
        local_files: dict[str, Path],
        stats: dict[str, int]
    ) -> None:
        """Remove files that no longer exist in Drive."""
        # Build set of expected local paths from Drive files
        expected_paths = set()
        for drive_file in drive_files:
            mime_type = drive_file["mime_type"]
            relative_path = drive_file["relative_path"]
            
            if mime_type in ["application/vnd.google-apps.document",
                            "application/vnd.google-apps.presentation",
                            "application/pdf"]:
                expected_paths.add(str(relative_path) + ".md")
            elif mime_type == "text/markdown" or drive_file["name"].lower().endswith('.md'):
                expected_paths.add(str(relative_path))
        
        # Find files to delete
        for local_path_str, local_path in local_files.items():
            if local_path_str not in expected_paths:
                try:
                    # Check if this file is tracked in metadata
                    is_tracked = any(
                        meta.get("local") == local_path_str
                        for meta in self.metadata.data.get("files", {}).values()
                    )
                    
                    if is_tracked:
                        local_path.unlink()
                        stats["deleted"] += 1
                        self._update_progress(current=f"Deleted {local_path_str}")
                except Exception as e:
                    print(f"Error deleting {local_path_str}: {e}")