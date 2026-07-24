import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { FileItem } from './FileItem';
import styles from './FolderTree.module.css';
export const FolderTree = ({ node, onSelectFile }) => {
    const [expandedFolders, setExpandedFolders] = useState(new Set());
    const toggleFolder = (path) => {
        const newExpanded = new Set(expandedFolders);
        if (newExpanded.has(path)) {
            newExpanded.delete(path);
        }
        else {
            newExpanded.add(path);
        }
        setExpandedFolders(newExpanded);
    };
    const renderNode = (node, depth = 0) => {
        const isExpanded = expandedFolders.has(node.path);
        if (node.type === 'file') {
            return (_jsx(FileItem, { node: node, depth: depth, onSelect: () => onSelectFile?.(node.path) }, node.path));
        }
        return (_jsxs("div", { className: styles.folder_item, children: [_jsxs("div", { className: styles.folder_header, style: { paddingLeft: `${depth * 1.5}rem` }, onClick: () => toggleFolder(node.path), children: [_jsx("span", { className: styles.icon, children: isExpanded ? '📂' : '📁' }), _jsx("span", { className: styles.name, children: node.name })] }), isExpanded && node.children && (_jsx("div", { className: styles.children, children: node.children.map((child) => renderNode(child, depth + 1)) }))] }, node.path));
    };
    // If this is the root node (path === ""), render children directly without a "Root" wrapper
    if (node.path === "" && node.children) {
        return _jsx("div", { className: styles.tree, children: node.children.map((child) => renderNode(child)) });
    }
    return _jsx("div", { className: styles.tree, children: renderNode(node) });
};
