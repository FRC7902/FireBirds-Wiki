import type {
  SyncStatus,
  SyncProgress,
  SyncResult,
  SyncHistoryEntry,
} from '@app-types/admin';

const API_BASE = '/api';

class AdminAPI {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async getStatus(): Promise<SyncStatus> {
    const response = await fetch(`${API_BASE}/admin/status`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch status');
    }

    return response.json();
  }

  async getProgress(): Promise<SyncProgress> {
    const response = await fetch(`${API_BASE}/admin/sync/status`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch progress');
    }

    return response.json();
  }

  async triggerSync(): Promise<SyncResult> {
    const response = await fetch(`${API_BASE}/admin/sync`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Sync failed' }));
      throw new Error(error.detail || 'Failed to trigger sync');
    }

    return response.json();
  }

  async getHistory(limit: number = 20): Promise<SyncHistoryEntry[]> {
    const response = await fetch(
      `${API_BASE}/admin/history?limit=${limit}`,
      {
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch history');
    }

    return response.json();
  }
}

export const adminAPI = new AdminAPI();