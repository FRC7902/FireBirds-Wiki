import { useState, useEffect } from 'react';
import { Document, TreeNode } from '@app-types/index';
import { apiClient } from '@api/client';

export const useDocuments = () => {
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load tree on mount
  useEffect(() => {
    const loadTree = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.getTree();
        setTree(response.tree);
      } catch (err) {
        setError('Failed to load directory tree');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTree();
  }, []);

  // Load all documents
  const loadAllDocuments = async () => {
    try {
      setIsLoading(true);
      const docs = await apiClient.getAllDocuments();
      setDocuments(docs);
    } catch (err) {
      setError('Failed to load documents');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load specific document
  const loadDocument = async (path: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const doc = await apiClient.getDocument(path);
      setCurrentDocument(doc);
    } catch (err) {
      setError(`Failed to load document: ${path}`);
      console.error(err);
      setCurrentDocument(null);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    tree,
    documents,
    currentDocument,
    isLoading,
    error,
    loadAllDocuments,
    loadDocument,
    setCurrentDocument,
  };
};
