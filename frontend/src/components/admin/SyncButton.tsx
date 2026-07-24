import React, { useState, useCallback } from 'react';
import { SyncResult } from '@app-types/admin';
import { adminAPI } from '@api/admin';
import './SyncButton.css';

interface SyncButtonProps {
  onSyncComplete: (result: SyncResult) => void;
  disabled?: boolean;
}

export const SyncButton: React.FC<SyncButtonProps> = ({ onSyncComplete, disabled }) => {
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSync = useCallback(async () => {
    setSyncing(true);
    setError(null);

    try {
      const result = await adminAPI.triggerSync();
      onSyncComplete(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setSyncing(false);
    }
  }, [onSyncComplete]);

  return (
    <div className="sync-button-container">
      <button
        onClick={handleSync}
        disabled={syncing || disabled}
        className="sync-button"
      >
        {syncing ? 'Syncing...' : 'Sync Now'}
      </button>
      {error && <div className="sync-error">{error}</div>}
    </div>
  );
};