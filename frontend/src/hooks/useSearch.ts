import { useState } from 'react';
import { SearchResult } from '@app-types/index';
import { apiClient } from '@api/client';

export const useSearch = () => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const searchResults = await apiClient.searchDocuments(query);
      setResults(searchResults);
    } catch (err) {
      setError('Failed to search documents');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
    setError(null);
  };

  return {
    results,
    isLoading,
    error,
    search,
    clearResults,
  };
};
