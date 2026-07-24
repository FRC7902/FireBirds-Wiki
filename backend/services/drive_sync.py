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
ROOT_DIR = Path(__file__).resolve().parents[2]
WIKI_DIR = Path(os.getenv("WIKI_CONTENT_DIR", ROOT_DIR / "Wiki"))
ASSET_DIR = WIKI_DIR / "_assets" / "drive"
REQUEST_TIMEOUT_SECONDS = 60


def _load_dotenv(path: Path) -> None:
    """Load simple KEY=VALUE pairs from a .env file into os.environ.

    This is a lightweight loader to avoid adding a dependency. Existing
    environment variables are not overridden.
    """
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
                # Do not override existing env vars
                os.environ.setdefault(key, val)
    except FileNotFoundError:
        return


# Load repository-root .env automatically if present so running the module
# from the repo root works without requiring the caller to export env vars.
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
    """Read file metadata embedded in a publicly shared Drive folder page.

    Drive does not expose a no-auth folder-listing API. Public folders do embed
    their visible item IDs, names, and MIME types in the share page, which lets
    this small wiki synchronizer access only files already public to everyone.
    """
    page = get_bytes(f"https://drive.google.com/drive/folders/{folder_id}").decode(
        "utf-8", errors="replace"
    )
    # The Drive page serializes the initial listing with JavaScript hex escapes.
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
        r'"(?P<name>.*?)","(?P<mime>application\\?/[^"\\]+)"',
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
        }


def write_bytes(path: Path, content: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_bytes(content)
    temporary.replace(path)


def frontmatter(file: dict[str, str], **extra: str) -> str:
    metadata = {
        "title": file["name"],
        "source_type": extra.pop("source_type"),
        "source_file_id": file["id"],
        "source_url": f"https://drive.google.com/open?id={file['id']}",
        **extra,
    }
    lines = ["---"]
    lines.extend(f"{key}: {json.dumps(value)}" for key, value in metadata.items() if value)
    return "\n".join([*lines, "---", ""])


def public_download_url(file_id: str) -> str:
    return f"https://drive.usercontent.google.com/download?id={file_id}&export=download&confirm=t"


def mirror_folder(folder_id: str, relative_dir: PurePosixPath, visited: set[str]) -> int:
    if folder_id in visited:
        return 0
    visited.add(folder_id)

    synced = 0
    for file in public_folder_items(folder_id):
        name = safe_name(file["name"])
        mime_type = file["mimeType"]
        if mime_type == FOLDER_MIME_TYPE:
            synced += mirror_folder(file["id"], relative_dir / name, visited)
            continue

        destination_dir = WIKI_DIR.joinpath(*relative_dir.parts)
        if mime_type == DOC_MIME_TYPE:
            asset_name = f"{file['id']}.pdf"
            write_bytes(
                ASSET_DIR / asset_name,
                get_bytes(f"https://docs.google.com/document/d/{file['id']}/export?format=pdf"),
            )
            content = (
                frontmatter(file, source_type="google_doc", pdf_url=f"/media/_assets/drive/{asset_name}")
                + f"# {file['name']}\n\nThis Google Doc is shown below.\n"
            )
            write_bytes(destination_dir / f"{name}.md", content.encode("utf-8"))
        elif mime_type == SLIDES_MIME_TYPE:
            asset_name = f"{file['id']}.pdf"
            write_bytes(
                ASSET_DIR / asset_name,
                get_bytes(f"https://docs.google.com/presentation/d/{file['id']}/export/pdf"),
            )
            content = (
                frontmatter(file, source_type="google_slides", pdf_url=f"/media/_assets/drive/{asset_name}")
                + f"# {file['name']}\n\nThis Google Slides presentation is shown below.\n"
            )
            write_bytes(destination_dir / f"{name}.md", content.encode("utf-8"))
        elif mime_type == PDF_MIME_TYPE or name.lower().endswith(".pdf"):
            asset_name = f"{file['id']}.pdf"
            write_bytes(ASSET_DIR / asset_name, get_bytes(public_download_url(file["id"])))
            content = (
                frontmatter(file, source_type="pdf", pdf_url=f"/media/_assets/drive/{asset_name}")
                + f"# {file['name']}\n\nThis PDF is shown below.\n"
            )
            write_bytes(destination_dir / f"{name}.md", content.encode("utf-8"))
        elif mime_type == "text/markdown" or name.lower().endswith(".md"):
            write_bytes(destination_dir / name, get_bytes(public_download_url(file["id"])))
        else:
            print(f"Skipping unsupported file: {file['name']} ({mime_type})")
            continue

        synced += 1
        print(f"Synced: {relative_dir / name}")
    return synced


def main() -> None:
    folder_id = folder_id_from_url(required_env("GOOGLE_DRIVE_FOLDER_URL"))
    WIKI_DIR.mkdir(parents=True, exist_ok=True)
    synced = mirror_folder(folder_id, PurePosixPath(), set())
    print(f"Drive sync complete: {synced} file(s) updated.")


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(f"Drive sync failed: {error}", file=sys.stderr)
        raise SystemExit(1) from error

