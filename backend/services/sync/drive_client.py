"""Google Drive client for fetching folder structure and files."""

from __future__ import annotations

import html
import json
import os
import re
import sys
from pathlib import Path, PurePosixPath
from typing import Iterator
from urllib.parse import urlparse

import requests


FOLDER_MIME_TYPE = "application/vnd.google-apps.folder"
DOC_MIME_TYPE = "application/vnd.google-apps.document"
SLIDES_MIME_TYPE = "application/vnd.google-apps.presentation"
PDF_MIME_TYPE = "application/pdf"
REQUEST_TIMEOUT_SECONDS = 60


def _load_dotenv(path: Path) -> None:
    """Load simple KEY=VALUE pairs from a .env file into os.environ."""
    try:
        with path.open("r", encoding="utf-8") as fh:
            for line in fh:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                if "=" not in line:
                    continue
                key, val = line.split("=", 1)
                key = key.strip()
                val = val.strip()
                if (val.startswith("\"") and val.endswith("\"")) or (
                    val.startswith("'") and val.endswith("'")
                ):
                    val = val[1:-1]
                os.environ.setdefault(key, val)
    except FileNotFoundError:
        return


ROOT_DIR = Path(__file__).resolve().parents[4]
_load_dotenv(ROOT_DIR / ".env")


def required_env(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"{name} must be set.")
    return value


def folder_id_from_url(folder_url: str) -> str:
    match = re.search(r"/folders/([A-Za-z0-9_-]+)", urlparse(folder_url).path)
    if not match:
        raise RuntimeError("GOOGLE_DRIVE_FOLDER_URL must be a Google Drive folder link.")
    return match.group(1)


def safe_name(name: str) -> str:
    """Produce a single safe local path segment from a Drive file name."""
    cleaned = re.sub(r'[<>:"/\\|?*\x00-\x1f]', "_", name).strip(". ")
    return cleaned or "untitled"


def get_bytes(url: str) -> bytes:
    response = requests.get(url, timeout=REQUEST_TIMEOUT_SECONDS)
    response.raise_for_status()
    return response.content


def public_folder_items(folder_id: str) -> Iterator[dict[str, str]]:
    """Read file metadata embedded in a publicly shared Drive folder page."""
    page = get_bytes(f"https://drive.google.com/drive/folders/{folder_id}").decode(
        "utf-8", errors="replace"
    )
    listing_match = re.search(
        r"window\['_DRIVE_ivd'\]\s*=\s*'(?P<listing>.*?)';",
        page,
        flags=re.DOTALL,
    )
    if not listing_match:
        raise RuntimeError(
            f"Could not read public folder {folder_id}. Confirm it is shared as "
            '"Anyone with the link".'
        )

    encoded_listing = listing_match.group("listing").replace("\\/", "/")
    listing = bytes(encoded_listing, "utf-8").decode("unicode_escape")
    item_pattern = re.compile(
        r'\["(?P<id>[A-Za-z0-9_-]+)",\["[A-Za-z0-9_-]+"\],'
        r'"(?P<name>.*?)","(?P<mime>application\\?/[^"\\]+)"'
        r'(?:,"(?P<modified_time>[^"]*)")?',
    )
    seen_ids: set[str] = set()
    for match in item_pattern.finditer(listing):
        item_id = match.group("id")
        if item_id in seen_ids:
            continue
        seen_ids.add(item_id)
        yield {
            "id": item_id,
            "name": html.unescape(match.group("name")),
            "mimeType": match.group("mime").replace("\\/", "/"),
            "modifiedTime": match.group("modified_time") or "",
        }


def public_download_url(file_id: str) -> str:
    return f"https://drive.usercontent.google.com/download?id={file_id}&export=download&confirm=t"


class DriveClient:
    """Client for interacting with Google Drive public folders."""

    def __init__(self, folder_url: str | None = None):
        if folder_url is None:
            folder_url = required_env("GOOGLE_DRIVE_FOLDER_URL")
        self.folder_id = folder_id_from_url(folder_url)

    def get_folder_items(self, folder_id: str | None = None) -> list[dict[str, str]]:
        """Get all items in a folder."""
        fid = folder_id or self.folder_id
        return list(public_folder_items(fid))

    def get_root_items(self) -> list[dict[str, str]]:
        """Get items in the root folder."""
        return self.get_folder_items(self.folder_id)

    def download_file(self, file_id: str) -> bytes:
        """Download a file from Google Drive."""
        url = public_download_url(file_id)
        return get_bytes(url)

    def download_google_doc_pdf(self, file_id: str) -> bytes:
        """Download a Google Doc as PDF."""
        url = f"https://docs.google.com/document/d/{file_id}/export?format=pdf"
        return get_bytes(url)

    def download_google_slides_pdf(self, file_id: str) -> bytes:
        """Download Google Slides as PDF."""
        url = f"https://docs.google.com/presentation/d/{file_id}/export/pdf"
        return get_bytes(url)

    def download_google_doc_text(self, file_id: str) -> str:
        """Download a Google Doc as plain text."""
        url = f"https://docs.google.com/document/d/{file_id}/export?format=txt"
        return get_bytes(url).decode('utf-8', errors='replace')

    def download_google_slides_text(self, file_id: str) -> str:
        """Download Google Slides as plain text."""
        url = f"https://docs.google.com/presentation/d/{file_id}/export?format=txt"
        return get_bytes(url).decode('utf-8', errors='replace')
