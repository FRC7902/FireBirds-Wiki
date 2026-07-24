import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@components/Navbar';
import { SearchBar } from '@components/SearchBar';
import { FolderTree } from '@components/FolderTree';
import { DocumentViewer } from '@components/DocumentViewer';
import { useDocuments } from '@hooks/useDocuments';
import styles from './HomePage.module.css';
export const HomePage = () => {
    const { tree, currentDocument, isLoading, error, loadDocument } = useDocuments();
    const navigate = useNavigate();
    const handleFileSelect = (path) => {
        loadDocument(path);
    };
    return (_jsxs("div", { className: styles.container, children: [_jsx(Navbar, {}), _jsxs("div", { className: styles.main, children: [_jsxs("div", { className: styles.sidebar, children: [_jsx(SearchBar, { onSearch: (query) => navigate(`/search?q=${encodeURIComponent(query)}`) }), tree && (_jsx(FolderTree, { node: tree, onSelectFile: handleFileSelect }))] }), _jsx(DocumentViewer, { document: currentDocument, isLoading: isLoading, error: error })] })] }));
};
