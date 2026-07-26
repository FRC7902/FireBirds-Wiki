"""Core synchronization manager for Google Drive to local wiki sync."""

from __future__ import annotations

import os
import re
import shutil
import time
from datetime import datetime, timezone
from pathlib import Path, PurePosixPath
from typing import Any, Callable, Optional
from urllib.parse import quote

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

        # Resolve root directory (always available)
        root_dir = Path(__file__).resolve().parents[4]

        # Resolve content directory
        if content_dir:
            self.content_dir = Path(content_dir)
        else:
            # Try to find Wiki directory
            candidates = [root_dir / "Wiki", root_dir / "wiki", root_dir / "content"]
            for candidate in candidates:
                if candidate.exists():
                    self.content_dir = candidate
                    break
            else:
                self.content_dir = root_dir / "Wiki"

        # Docusaurus docs directory for markdown output
        self.docs_dir = root_dir / "website" / "docs"
        # Docusaurus static directory for asset output
        self.static_docs_dir = root_dir / "website" / "static" / "docs"

        self.content_dir.mkdir(parents=True, exist_ok=True)
        self.docs_dir.mkdir(parents=True, exist_ok=True)
        self.static_docs_dir.mkdir(parents=True, exist_ok=True)
        self.progress_callback = progress_callback

    def _update_progress(self, **kwargs: Any) -> None:
        """Update progress if callback is set."""
        if self.progress_callback:
            self.progress_callback(kwargs)

    def _format_searchable_text(self, text: str) -> str:
        """Format extracted text for inclusion in a hidden searchable block.

        Args:
            text: Raw extracted text from document

        Returns:
            Formatted text with proper indentation for Markdown
        """
        if not text:
            return ""

        # Strip non-printable characters (except common whitespace: \n, \r, \t)
        # This prevents YAML parsing errors from control characters like U+0088
        import re
        text = re.sub(r'[^\x20-\x7E\x0A\x0D\x09\xA0-\xFF\u0100-\uFFFF]', '', text)

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

        return '\n'.join(cleaned_lines)

    def _extract_pdf_text(self, pdf_content: bytes) -> str:
        """Extract text from PDF content.

        Args:
            pdf_content: Raw PDF bytes

        Returns:
            Extracted text content
        """
        try:
            import io
            from PyPDF2 import PdfReader

            pdf_file = io.BytesIO(pdf_content)
            reader = PdfReader(pdf_file)

            text_parts = []
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)

            return '\n'.join(text_parts)
        except Exception as e:
            print(f"Warning: Failed to extract PDF text: {e}")
            return ""

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
                            "relative_path": relative_path / safe_filename if relative_path else PurePosixPath(safe_filename),
                            "modified_time": item.get("modifiedTime", ""),
                        })
            except Exception as e:
                print(f"Error scanning folder {folder_id}: {e}")

        # Start from root
        scan_folder(self.drive_client.folder_id, PurePosixPath())

        return files

    def _get_all_local_files(self) -> dict[str, Path]:
        """Get all local files indexed by their relative path."""
        local_files = {}

        # Scan both content_dir and docs_dir for local files
        for base_dir in [self.content_dir, self.docs_dir]:
            if not base_dir.exists():
                continue
            for file_path in base_dir.rglob("*"):
                if file_path.is_file() and not file_path.name.startswith('.'):
                    try:
                        relative = file_path.relative_to(base_dir)
                        local_files[str(relative)] = file_path
                    except ValueError:
                        pass

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
                if mime_type == "application/pdf" or name.lower().endswith('.pdf'):
                    # PDFs use .pdf.md extension and go to website/docs/
                    local_path = self.docs_dir / f"{relative_path}.pdf.md"
                else:
                    # Google Docs/Slides use .md extension and go to content_dir
                    local_path = self.content_dir / f"{relative_path}.md"
            elif name.lower().endswith('.md') or mime_type == 'text/markdown':
                local_path = self.content_dir / relative_path
            else:
                # Skip unsupported files
                stats["skipped"] += 1
                return

            # Check if file needs update
            file_meta = self.metadata.get_file_metadata(drive_id)

            # Get Drive modified time for incremental sync
            drive_modified_time = drive_file.get("modified_time", "")

            # Skip if file hasn't changed (incremental sync)
            if file_meta and drive_modified_time:
                if not self.metadata.is_file_modified(drive_id, drive_modified_time):
                    stats["skipped"] += 1
                    self._update_progress(current=f"Skipped {relative_path} (unchanged)")
                    return

            # Download and save file, get extracted text
            text_content = self._download_and_save(drive_file, local_path)

            # Update metadata (no large text content stored)
            self.metadata.update_file_metadata(
                drive_id=drive_id,
                modified_time=drive_modified_time or datetime.now(timezone.utc).isoformat(),
                path=str(drive_file["path"]),
                local_path=str(local_path.relative_to(self.content_dir)) if local_path.is_relative_to(self.content_dir) else str(local_path.relative_to(self.docs_dir)),
                text_content=None
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

    def _generate_markdown_content(
        self,
        name: str,
        asset_relative_path: str,
        text_content: str | None,
        description: str = "This PDF is shown below.",
        relative_path: str | None = None,
    ) -> str:
        """Generate Markdown content with hidden searchable text block.

        Args:
            name: Document name (without extension)
            asset_relative_path: Relative path to the PDF asset
            text_content: Extracted text content for hidden searchable block
            description: Description text to show above the PDF
            relative_path: Relative path for slug generation (to handle special chars in filenames)

        Returns:
            Markdown content string
        """
        # URL-encode the PDF filename for the download link
        pdf_filename = os.path.basename(asset_relative_path)
        pdf_url = quote(pdf_filename)

        # Build frontmatter (no extracted text in YAML)
        frontmatter = f"""---
title: "{name}"
sidebar_label: "{name}"
"""

        # Add slug if the name contains characters that could break Docusaurus slug generation
        if relative_path and not re.match(r'^[a-zA-Z0-9_\-./]+$', relative_path):
            # Generate a safe slug by replacing special characters
            safe_slug = re.sub(r'[^a-zA-Z0-9_\-/]', '-', relative_path)
            safe_slug = re.sub(r'-+', '-', safe_slug).strip('-')
            frontmatter += f'slug: /{safe_slug}\n'

        frontmatter += "---\n"

        # Build body with download link
        body = f"""
# {name}

[Download the PDF](./{pdf_url})

"""

        # Add hidden searchable content block
        if text_content:
            formatted_text = self._format_searchable_text(text_content)
            body += f"""<!-- Hidden searchable content -->
<details style={{display: "none"}}>
<summary></summary>

# Full Text (Hidden)

{formatted_text}

</details>
"""

        return frontmatter + body

    def _download_and_save(self, drive_file: dict[str, Any], local_path: Path) -> str | None:
        """Download a file from Drive and save it locally.

        Returns:
            Extracted text content for hidden searchable block, or None if not applicable
        """
        drive_id = drive_file["id"]
        mime_type = drive_file["mime_type"]
        name = drive_file["name"]
        safe_filename = drive_file["safe_name"]
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

            # Create Docusaurus-compatible markdown with hidden searchable content
            content = self._generate_markdown_content(
                name=safe_filename,
                asset_relative_path=f"/assets/{asset_name}",
                text_content=text_content,
                description="This Google Doc is shown below."
            )
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

            # Create Docusaurus-compatible markdown with hidden searchable content
            content = self._generate_markdown_content(
                name=safe_filename,
                asset_relative_path=f"/assets/{asset_name}",
                text_content=text_content,
                description="This Google Slides presentation is shown below."
            )
            local_path.write_text(content, encoding='utf-8')

        elif mime_type == "application/pdf" or name.lower().endswith('.pdf'):
            # Download PDF and create Docusaurus markdown wrapper
            pdf_content = self.drive_client.download_file(drive_id)

            # Save PDF to website/static/docs/<CATEGORY>/<SUBCATEGORY>/<FILENAME>.pdf
            relative_path = drive_file["relative_path"]
            # Get the directory part of the relative path (category/subcategory)
            relative_dir = relative_path.parent if str(relative_path) else PurePosixPath()
            pdf_asset_path = self.static_docs_dir / relative_dir / f"{safe_filename}.pdf"
            pdf_asset_path.parent.mkdir(parents=True, exist_ok=True)
            pdf_asset_path.write_bytes(pdf_content)

            # Extract text from PDF for search indexing
            text_content = self._extract_pdf_text(pdf_content)

            # Create Docusaurus-compatible markdown with hidden searchable content
            # The PDF is in the same directory as the markdown, so use relative path
            content = self._generate_markdown_content(
                name=safe_filename,
                asset_relative_path=f"{safe_filename}.pdf",
                text_content=text_content,
                description="This PDF is shown below."
            )
            local_path.write_text(content, encoding='utf-8')

        elif mime_type == "text/markdown" or name.lower().endswith('.md'):
            # Download markdown directly
            content = self.drive_client.download_file(drive_id)
            local_path.write_bytes(content)
            # For markdown files, no text extraction needed
            text_content = None

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
                            "application/vnd.google-apps.presentation"]:
                expected_paths.add(str(relative_path) + ".md")
            elif mime_type == "application/pdf" or drive_file["name"].lower().endswith('.pdf'):
                expected_paths.add(str(relative_path) + ".pdf.md")
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
