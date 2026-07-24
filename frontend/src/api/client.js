import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
class ApiClient {
    client;
    constructor() {
        this.client = axios.create({
            baseURL: API_URL,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
    // Tree endpoints
    async getTree() {
        const response = await this.client.get('/api/tree/');
        return response.data;
    }
    async getSiblings(path) {
        const response = await this.client.get(`/api/tree/siblings/${path}`);
        return response.data;
    }
    // Document endpoints
    async getAllDocuments() {
        const response = await this.client.get('/api/documents/all');
        return response.data;
    }
    async getDocument(path) {
        const response = await this.client.get(`/api/documents/${path}`);
        return response.data;
    }
    async searchDocuments(query) {
        const response = await this.client.get('/api/documents/search', {
            params: { q: query },
        });
        return response.data;
    }
    // Health check
    async health() {
        const response = await this.client.get('/health');
        return response.data;
    }
}
export const apiClient = new ApiClient();
export default apiClient;
