import React from 'react';
import { SyncStatus } from '@app-types/admin';
import './SyncStatusCard.css';

interface SyncStatusCardProps {
  status: SyncStatus;
}

export const SyncStatusCard: React.FC<SyncStatusCardProps> = ({ status }) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="sync-status-card">
      <h2>Google Drive Status</h2>
      
      <div className="status-item">
        <span className="status-label">Last Sync</span>
        <span className="status-value">{formatDate(status.lastSync)}</span>
      </div>

      <div className="status-item">
        <span className="status-label">Status</span>
        <span className={`status-badge ${status.running ? 'running' : 'healthy'}`}>
          {status.running ? 'Syncing...' : 'Healthy'}
        </span>
      </div>

      <div className="status-item">
        <span className="status-label">Documents</span>
        <span className="status-value">{status.documents}</span>
      </div>

      <div className="status-item">
        <span className="status-label">Folders</span>
        <span className="status-value">{status.folders}</span>
      </div>
    </div>
  );
};