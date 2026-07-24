import React from 'react';
import { SyncHistoryEntry } from '@app-types/admin';
import './RecentSyncHistory.css';

interface RecentSyncHistoryProps {
  history: SyncHistoryEntry[];
}

export const RecentSyncHistory: React.FC<RecentSyncHistoryProps> = ({ history }) => {
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (history.length === 0) {
    return (
      <div className="sync-history-card">
        <h2>Recent Sync History</h2>
        <p className="no-history">No sync history available</p>
      </div>
    );
  }

  return (
    <div className="sync-history-card">
      <h2>Recent Sync History</h2>
      
      <div className="history-list">
        {history.map((entry, index) => (
          <div key={index} className="history-item">
            <div className="history-header">
              <span className="history-date">{formatDate(entry.timestamp)}</span>
              <span className={`history-badge ${entry.status}`}>
                {entry.trigger}
              </span>
            </div>
            
            <div className="history-details">
              <span className="history-time">{formatTime(entry.timestamp)}</span>
              <span className="history-duration">{entry.duration}</span>
            </div>
            
            <div className="history-stats">
              {entry.new > 0 && (
                <span className="history-stat new">+{entry.new} new</span>
              )}
              {entry.updated > 0 && (
                <span className="history-stat updated">{entry.updated} updated</span>
              )}
              {entry.deleted > 0 && (
                <span className="history-stat deleted">-{entry.deleted} deleted</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};