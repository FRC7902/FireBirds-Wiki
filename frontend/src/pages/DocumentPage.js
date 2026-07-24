import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '@components/Navbar';
import { SearchBar } from '@components/SearchBar';
import { FolderTree } from '@components/FolderTree';
import { DocumentViewer } from '@components/DocumentViewer';
import { Breadcrumbs } from '@components/Breadcrumbs';
import { useDocuments } from '@hooks/useDocuments';
import styles from './DocumentPage.module.css';
export const DocumentPage = () => {
    const { '*': docPath } = useParams();
    const navigate = useNavigate();
    const { tree, currentDocument, isLoading, error, loadDocument } = useDocuments();
    useEffect(() => {
        if (docPath) {
            loadDocument(docPath);
        }
    }, [docPath, loadDocument]);
    const generateBreadcrumbs = () => {
        if (!docPath)
            return [];
        const parts = docPath.split('/');
        return parts.slice(0, -1).map((part, index) => ({
            label: part,
            path: `/doc/${parts.slice(0, index + 1).join('/')}`,
        }));
    };
    return (_jsxs("div", { className: styles.container, children: [_jsx(Navbar, {}), _jsxs("div", { className: styles.main, children: [_jsxs("div", { className: styles.sidebar, children: [_jsx(SearchBar, { onSearch: (query) => navigate(`/search?q=${encodeURIComponent(query)}`) }), tree && (_jsx(FolderTree, { node: tree, onSelectFile: (path) => navigate(`/doc/${path}`) }))] }), _jsxs("div", { className: styles.viewer, children: [_jsx(Breadcrumbs, { items: generateBreadcrumbs() }), _jsx(DocumentViewer, { document: currentDocument, isLoading: isLoading, error: error })] })] })] }));
};
