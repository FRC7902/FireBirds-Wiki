export interface SyncStatus {
  lastSync: string | null;
  documents: number;
  folders: number;
  running: boolean;
}

export interface SyncProgress {
  running: boolean;
  progress: number;
  current: string;
}

export interface SyncResult {
  status: string;
  new: number;
  updated: number;
  deleted: number;
  skipped: number;
  failed: number;
  duration: string;
  reason?: string;
}

export interface SyncHistoryEntry {
  timestamp: string;
  status: string;
  new: number;
  updated: number;
  deleted: number;
  skipped: number;
  duration: string;
  trigger: string;
}

export interface AdminStats {
  documents: number;
  folders: number;
  lastSync: string | null;
}