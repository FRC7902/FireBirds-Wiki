import React, { useState, useEffect, useCallback } from 'react';
import { SyncStatus, SyncProgress, SyncResult, SyncHistoryEntry } from '@app-types/admin';
import { adminAPI } from '@api/admin';
import { SyncStatusCard } from './SyncStatusCard';
import { SyncButton } from './SyncButton';
import { ProgressBar } from './ProgressBar';
import { StatisticsCard } from './StatisticsCard';
import { RecentSyncHistory } from './RecentSyncHistory';
import './AdminDashboard.css';

export const AdminDashboard: React.FC = () => {
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [progress, setProgress] = useState<SyncProgress>({ running: false, progress: 0, current: '' });
  const [lastResult, setLastResult] = useState<SyncResult | null>(null);
  const [history, setHistory] = useState<SyncHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const statusData = await adminAPI.getStatus();
      setStatus(statusData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch status');
    }
  }, []);

  const fetchProgress = useCallback(async () => {
    try {
      const progressData = await adminAPI.getProgress();
      setProgress(progressData);
    } catch (err) {
      console.error('Failed to fetch progress:', err);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      const historyData = await adminAPI.getHistory(20);
      setHistory(historyData);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  }, []);

  const handleSyncComplete = useCallback((result: SyncResult) => {
    setLastResult(result);
    // Refresh status and history after sync
    fetchStatus();
    fetchHistory();
  }, [fetchStatus, fetchHistory]);

  // Poll for progress when sync is running
  useEffect(() => {
    if (!progress.running) {
      return;
    }

    const interval = setInterval(() => {
      fetchProgress();
    }, 1000);

    return () => clearInterval(interval);
  }, [progress.running, fetchProgress]);

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchStatus(),
        fetchHistory(),
      ]);
      setLoading(false);
    };

    loadData();
  }, [fetchStatus, fetchHistory]);

  if (loading) {
    return <div className="admin-dashboard loading">Loading...</div>;
  }

  if (error && !status) {
    return <div className="admin-dashboard error">Error: {error}</div>;
  }

  return (
    <div className="admin-dashboard">
      <h1>Administration</h1>

      {status && <SyncStatusCard status={status} />}

      <div className="admin-section">
        <h2>Synchronization</h2>
        <ProgressBar progress={progress} />
        <SyncButton onSyncComplete={handleSyncComplete} disabled={progress.running} />
        <StatisticsCard result={lastResult} />
      </div>

      <RecentSyncHistory history={history} />
    </div>
  );
};