import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Breadcrumbs.module.css';
export const Breadcrumbs = ({ items }) => {
    const navigate = useNavigate();
    if (items.length === 0) {
        return null;
    }
    return (_jsxs("nav", { className: styles.breadcrumbs, children: [_jsx("button", { onClick: () => navigate('/'), className: styles.item, children: "\uD83C\uDFE0 Home" }), items.map((item) => (_jsxs(React.Fragment, { children: [_jsx("span", { className: styles.separator, children: "/" }), _jsx("button", { onClick: () => navigate(item.path), className: styles.item, children: item.label })] }, item.path)))] }));
};
