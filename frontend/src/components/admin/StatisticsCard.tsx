import React from 'react';
import { SyncResult } from '@app-types/admin';
import './StatisticsCard.css';

interface StatisticsCardProps {
  result: SyncResult | null;
}

export const StatisticsCard: React.FC<StatisticsCardProps> = ({ result }) => {
  if (!result) {
    return null;
  }

  const isSuccess = result.status === 'completed';

  return (
    <div className={`statistics-card ${isSuccess ? 'success' : 'error'}`}>
      <h3>{isSuccess ? 'Sync Complete' : 'Sync Failed'}</h3>
      
      {isSuccess ? (
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-value new">{result.new}</span>
            <span className="stat-label">New Documents</span>
          </div>
          
          <div className="stat-item">
            <span className="stat-value updated">{result.updated}</span>
            <span className="stat-label">Updated</span>
          </div>
          
          <div className="stat-item">
            <span className="stat-value deleted">{result.deleted}</span>
            <span className="stat-label">Deleted</span>
          </div>
          
          <div className="stat-item">
            <span className="stat-value duration">{result.duration}</span>
            <span className="stat-label">Duration</span>
          </div>
        </div>
      ) : (
        <div className="error-message">
          {result.reason || 'An unknown error occurred'}
        </div>
      )}
    </div>
  );
};