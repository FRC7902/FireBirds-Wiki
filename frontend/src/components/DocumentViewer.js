import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styles from './DocumentViewer.module.css';
import { PdfRenderer } from './PdfRenderer';
export const DocumentViewer = ({ document, isLoading = false, error = null, }) => {
    if (isLoading) {
        return _jsx("div", { className: styles.viewer, children: "Loading..." });
    }
    if (error) {
        return _jsxs("div", { className: styles.error, children: ["Error: ", error] });
    }
    if (!document) {
        return (_jsx("div", { className: styles.empty, children: _jsx("p", { children: "Select a document to view" }) }));
    }
    return (_jsxs("div", { className: styles.viewer, children: [_jsx("div", { className: styles.metadata, children: document.metadata.tags && document.metadata.tags.length > 0 && (_jsx("div", { className: styles.tags, children: document.metadata.tags.map((tag) => (_jsxs("span", { className: styles.tag, children: ["#", tag] }, tag))) })) }), _jsxs("div", { className: styles.content, children: [_jsx("h1", { children: document.title }), document.metadata.pdf_url && (_jsx(PdfRenderer, { url: document.metadata.pdf_url })), document.metadata.description && (_jsx("p", { className: styles.description, children: document.metadata.description })), _jsx("div", { className: styles.markdown, children: document.content || 'No content available' })] })] }));
};
