import React from 'react';
import { SyncProgress } from '@app-types/admin';
import './ProgressBar.css';

interface ProgressBarProps {
  progress: SyncProgress;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  if (!progress.running && progress.progress === 0) {
    return null;
  }

  return (
    <div className="progress-container">
      <div className="progress-info">
        <span className="progress-status">
          {progress.running ? 'Syncing...' : 'Complete'}
        </span>
        <span className="progress-percent">{progress.progress}%</span>
      </div>
      
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${progress.progress}%` }}
        />
      </div>
      
      {progress.current && (
        <div className="progress-current">{progress.current}</div>
      )}
    </div>
  );
};