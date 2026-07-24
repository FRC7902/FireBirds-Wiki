import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styles from './FileItem.module.css';
export const FileItem = ({ node, depth, onSelect }) => {
    return (_jsxs("div", { className: styles.file_item, style: { paddingLeft: `${depth * 1.5}rem` }, onClick: onSelect, children: [_jsx("span", { className: styles.icon, children: "\uD83D\uDCC4" }), _jsxs("div", { className: styles.content, children: [_jsx("div", { className: styles.title, children: node.title || node.name }), node.description && (_jsx("div", { className: styles.description, children: node.description }))] })] }));
};
