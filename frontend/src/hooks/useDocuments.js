import { useState, useEffect } from 'react';
import wikiData from '../generated/wiki-data.json';
const staticTree = wikiData.tree || null;
const staticDocuments = wikiData.documents || [];
export const useDocuments = () => {
    const [tree, setTree] = useState(staticTree);
    const [documents, setDocuments] = useState(staticDocuments);
    const [currentDocument, setCurrentDocument] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    useEffect(() => {
        if (staticTree) {
            setTree(staticTree);
        }
        if (staticDocuments.length > 0) {
            setDocuments(staticDocuments);
        }
    }, []);
    const loadAllDocuments = async () => {
        try {
            setIsLoading(true);
            setDocuments(staticDocuments);
        }
        catch (err) {
            setError('Failed to load documents');
            console.error(err);
        }
        finally {
            setIsLoading(false);
        }
    };
    const loadDocument = async (path) => {
        try {
            setIsLoading(true);
            setError(null);
            const doc = staticDocuments.find((item) => item.path === path) ?? null;
            if (!doc) {
                setCurrentDocument(null);
                setError(`Failed to load document: ${path}`);
                return;
            }
            setCurrentDocument(doc);
        }
        catch (err) {
            setError(`Failed to load document: ${path}`);
            console.error(err);
            setCurrentDocument(null);
        }
        finally {
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
