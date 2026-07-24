import axios, { AxiosInstance } from 'axios';
import { Document, TreeNode, SearchResult } from '@app-types/index';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Tree endpoints
  async getTree(): Promise<{ tree: TreeNode }> {
    const response = await this.client.get('/api/tree/');
    return response.data;
  }

  async getSiblings(path: string): Promise<Array<{ name: string; path: string }>> {
    const response = await this.client.get(`/api/tree/siblings/${path}`);
    return response.data;
  }

  // Document endpoints
  async getAllDocuments(): Promise<Document[]> {
    const response = await this.client.get('/api/documents/all');
    return response.data;
  }

  async getDocument(path: string): Promise<Document> {
    const response = await this.client.get(`/api/documents/${path}`);
    return response.data;
  }

  async searchDocuments(query: string): Promise<SearchResult[]> {
    const response = await this.client.get('/api/documents/search', {
      params: { q: query },
    });
    return response.data;
  }

  // Health check
  async health(): Promise<{ status: string }> {
    const response = await this.client.get('/health');
    return response.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
