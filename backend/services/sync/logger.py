"""Logging utilities for synchronization."""

from __future__ import annotations

import logging
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


class SyncLogger:
    """Handles logging for synchronization operations."""

    def __init__(self, log_file: str = "sync.log"):
        self.log_file = Path(log_file)
        self.logger = self._setup_logger()

    def _setup_logger(self) -> logging.Logger:
        """Set up the logger with file and console handlers."""
        logger = logging.getLogger("sync")
        logger.setLevel(logging.INFO)
        
        # Prevent duplicate handlers
        if logger.handlers:
            return logger
        
        # Console handler
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(logging.INFO)
        console_formatter = logging.Formatter(
            '[%(asctime)s] %(message)s',
            datefmt='%H:%M'
        )
        console_handler.setFormatter(console_formatter)
        logger.addHandler(console_handler)
        
        # File handler
        try:
            self.log_file.parent.mkdir(parents=True, exist_ok=True)
            file_handler = logging.FileHandler(self.log_file, encoding='utf-8')
            file_handler.setLevel(logging.INFO)
            file_formatter = logging.Formatter(
                '[%(asctime)s] %(message)s',
                datefmt='%Y-%m-%d %H:%M:%S'
            )
            file_handler.setFormatter(file_formatter)
            logger.addHandler(file_handler)
        except Exception as e:
            logger.warning(f"Could not set up file logging: {e}")
        
        return logger

    def info(self, message: str) -> None:
        """Log info message."""
        self.logger.info(message)

    def warning(self, message: str) -> None:
        """Log warning message."""
        self.logger.warning(message)

    def error(self, message: str, exc_info: bool = False) -> None:
        """Log error message."""
        self.logger.error(message, exc_info=exc_info)

    def log_sync_start(self, trigger: str = "manual") -> None:
        """Log sync start."""
        timestamp = datetime.now(timezone.utc).strftime('%H:%M')
        self.info(f"[{timestamp}] Starting sync ({trigger})")

    def log_sync_complete(self, stats: dict[str, Any], duration: float) -> None:
        """Log sync completion."""
        timestamp = datetime.now(timezone.utc).strftime('%H:%M')
        total = sum(stats.get(k, 0) for k in ['new', 'updated', 'deleted', 'skipped', 'failed'])
        self.info(
            f"[{timestamp}] Finished - {total} scanned, "
            f"{stats.get('new', 0)} new, {stats.get('updated', 0)} updated, "
            f"{stats.get('deleted', 0)} deleted, {stats.get('failed', 0)} failed "
            f"({duration:.1f}s)"
        )

    def log_folder_scan(self, folder_path: str) -> None:
        """Log folder scanning."""
        timestamp = datetime.now(timezone.utc).strftime('%H:%M')
        self.info(f"[{timestamp}] Scanning {folder_path}")

    def log_file_download(self, file_path: str, action: str = "Downloaded") -> None:
        """Log file download."""
        timestamp = datetime.now(timezone.utc).strftime('%H:%M')
        self.info(f"[{timestamp}] {action} {file_path}")

    def log_file_skip(self, file_path: str, reason: str) -> None:
        """Log file skip."""
        self.warning(f"Skipping {file_path}: {reason}")

    def log_error(self, error: str, exc_info: bool = False) -> None:
        """Log error."""
        self.error(f"Error: {error}", exc_info=exc_info)