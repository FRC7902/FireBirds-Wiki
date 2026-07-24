import { useState } from 'react';
import { SearchResult } from '@app-types/index';
import wikiData from '../generated/wiki-data.json';

const staticDocuments = (wikiData.documents as SearchResult[]) || [];

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
      const normalized = query.toLowerCase();
      const searchResults = staticDocuments.filter((doc) => {
        const title = (doc.title || '').toLowerCase();
        const content = (doc.content || '').toLowerCase();
        return title.includes(normalized) || content.includes(normalized);
      });
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
