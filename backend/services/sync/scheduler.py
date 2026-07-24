"""Scheduler for automatic weekly synchronization."""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any, Callable, Optional

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from .sync_manager import SyncManager
from .metadata import MetadataManager

logger = logging.getLogger(__name__)


class SyncScheduler:
    """Manages scheduled synchronization jobs."""

    def __init__(
        self,
        sync_manager: SyncManager | None = None,
        metadata_manager: MetadataManager | None = None
    ):
        self.sync_manager = sync_manager or SyncManager()
        self.metadata = metadata_manager or MetadataManager()
        self.scheduler = AsyncIOScheduler()
        self._current_sync_task: Any = None
        self._progress_callback: Callable[[dict[str, Any]], None] | None = None

    def set_progress_callback(self, callback: Callable[[dict[str, Any]], None]) -> None:
        """Set a callback for progress updates."""
        self._progress_callback = callback

    def start(self) -> None:
        """Start the scheduler."""
        # Schedule sync every Sunday at 2:00 AM
        self.scheduler.add_job(
            self._run_automatic_sync,
            trigger=CronTrigger(day_of_week="sun", hour=2, minute=0),
            id="weekly_sync",
            name="Weekly Google Drive Sync",
            replace_existing=True,
            max_instances=1
        )
        
        self.scheduler.start()
        logger.info("Sync scheduler started - weekly sync scheduled for Sundays at 2:00 AM")

    def stop(self) -> None:
        """Stop the scheduler."""
        self.scheduler.shutdown(wait=False)
        logger.info("Sync scheduler stopped")

    async def _run_automatic_sync(self) -> None:
        """Run automatic synchronization."""
        logger.info("Starting automatic sync")
        
        try:
            # Update progress callback if set
            if self._progress_callback:
                self.sync_manager.progress_callback = self._progress_callback
            
            result = self.sync_manager.sync(trigger="automatic")
            
            if result.get("status") == "completed":
                logger.info(
                    f"Automatic sync completed: {result.get('new', 0)} new, "
                    f"{result.get('updated', 0)} updated, {result.get('deleted', 0)} deleted"
                )
            else:
                logger.error(f"Automatic sync failed: {result.get('reason', 'Unknown error')}")
        
        except Exception as e:
            logger.error(f"Automatic sync error: {e}", exc_info=True)

    def trigger_manual_sync(self) -> dict[str, Any]:
        """
        Trigger a manual synchronization.
        
        Returns:
            Dict with sync results
        """
        logger.info("Starting manual sync")
        
        try:
            # Update progress callback if set
            if self._progress_callback:
                self.sync_manager.progress_callback = self._progress_callback
            
            result = self.sync_manager.sync(trigger="manual")
            
            if result.get("status") == "completed":
                logger.info(
                    f"Manual sync completed: {result.get('new', 0)} new, "
                    f"{result.get('updated', 0)} updated, {result.get('deleted', 0)} deleted"
                )
            else:
                logger.error(f"Manual sync failed: {result.get('reason', 'Unknown error')}")
            
            return result
        
        except Exception as e:
            logger.error(f"Manual sync error: {e}", exc_info=True)
            return {
                "status": "failed",
                "reason": str(e),
                "new": 0,
                "updated": 0,
                "deleted": 0,
                "skipped": 0,
                "failed": 0,
                "duration": "0.0s"
            }

    def get_status(self) -> dict[str, Any]:
        """
        Get current sync status.
        
        Returns:
            Dict with status information
        """
        last_sync = self.metadata.get_last_sync()
        stats = self.metadata.get_statistics()
        
        return {
            "lastSync": last_sync.isoformat().replace('+00:00', 'Z') if last_sync else None,
            "documents": stats.get("documents", 0),
            "folders": stats.get("folders", 0),
            "running": self._current_sync_task is not None
        }

    def get_next_sync_time(self) -> datetime | None:
        """Get the next scheduled sync time."""
        job = self.scheduler.get_job("weekly_sync")
        if job:
            return job.next_run_time
        return None