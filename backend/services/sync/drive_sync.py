"""Entry point for Google Drive synchronization from command line."""

from __future__ import annotations

import os
import sys
from pathlib import Path
from typing import Any

from .sync_manager import SyncManager
from .metadata import MetadataManager


def main() -> int:
    """
    Main entry point for Drive sync.
    
    Returns:
        Exit code (0 for success, 1 for failure)
    """
    # Get environment variables
    drive_folder_url = os.getenv("GOOGLE_DRIVE_FOLDER_URL")
    content_dir = os.getenv("WIKI_CONTENT_DIR", "./Wiki")
    
    if not drive_folder_url:
        print("Error: GOOGLE_DRIVE_FOLDER_URL environment variable not set")
        return 1
    
    try:
        # Initialize sync manager
        sync_manager = SyncManager(content_dir=content_dir)
        
        print("Starting Google Drive synchronization...")
        print(f"Content directory: {sync_manager.content_dir}")
        
        # Run sync
        result = sync_manager.sync(trigger="automatic")
        
        # Print results
        if result.get("status") == "completed":
            print(f"\n✓ Sync completed successfully")
            print(f"  New files:      {result.get('new', 0)}")
            print(f"  Updated files:  {result.get('updated', 0)}")
            print(f"  Deleted files:  {result.get('deleted', 0)}")
            print(f"  Skipped files:  {result.get('skipped', 0)}")
            print(f"  Failed files:   {result.get('failed', 0)}")
            print(f"  Duration:       {result.get('duration', '0.0s')}")
            return 0
        else:
            print(f"\n✗ Sync failed: {result.get('reason', 'Unknown error')}")
            print(f"  New files:      {result.get('new', 0)}")
            print(f"  Updated files:  {result.get('updated', 0)}")
            print(f"  Deleted files:  {result.get('deleted', 0)}")
            print(f"  Skipped files:  {result.get('skipped', 0)}")
            print(f"  Failed files:   {result.get('failed', 0)}")
            print(f"  Duration:       {result.get('duration', '0.0s')}")
            return 1
    
    except Exception as e:
        print(f"\n✗ Fatal error during sync: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(main())