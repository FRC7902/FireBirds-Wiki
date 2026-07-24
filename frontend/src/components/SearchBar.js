import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SearchBar.module.css';
export const SearchBar = ({ onSearch }) => {
    const [query, setQuery] = useState('');
    const navigate = useNavigate();
    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            if (onSearch) {
                onSearch(query);
            }
            navigate(`/search?q=${encodeURIComponent(query)}`);
        }
    };
    return (_jsxs("form", { className: styles.searchbar, onSubmit: handleSearch, children: [_jsx("input", { type: "text", placeholder: "Search documents...", value: query, onChange: (e) => setQuery(e.target.value), className: styles.input }), _jsx("button", { type: "submit", className: styles.button, children: "\uD83D\uDD0D" })] }));
};
