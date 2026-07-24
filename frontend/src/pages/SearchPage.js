import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Navbar } from '@components/Navbar';
import { SearchBar } from '@components/SearchBar';
import { Breadcrumbs } from '@components/Breadcrumbs';
import { useSearch } from '@hooks/useSearch';
import styles from './SearchPage.module.css';
export const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { results, isLoading, search } = useSearch();
    const query = searchParams.get('q') || '';
    useEffect(() => {
        if (query) {
            search(query);
        }
    }, [query, search]);
    return (_jsxs("div", { className: styles.container, children: [_jsx(Navbar, {}), _jsxs("div", { className: styles.main, children: [_jsxs("div", { className: styles.sidebar, children: [_jsx(SearchBar, {}), _jsxs("div", { className: styles.results_list, children: [_jsxs("h3", { children: ["Search Results (", results.length, ")"] }), results.length > 0 ? (_jsx("div", { className: styles.results, children: results.map((doc) => (_jsxs("div", { className: styles.result_item, onClick: () => navigate(`/doc/${doc.path}`), children: [_jsx("h4", { children: doc.title }), doc.metadata.description && (_jsx("p", { children: doc.metadata.description }))] }, doc.path))) })) : (_jsx("p", { className: styles.no_results, children: isLoading ? 'Searching...' : 'No results found' }))] })] }), _jsxs("div", { className: styles.viewer, children: [_jsx(Breadcrumbs, { items: [
                                    {
                                        label: 'Search Results',
                                        path: `/search?q=${encodeURIComponent(query)}`,
                                    },
                                ] }), results.length > 0 ? (_jsxs("div", { className: styles.content, children: [_jsxs("h2", { children: ["Search Results for \"", query, "\""] }), _jsx("div", { className: styles.results_grid, children: results.map((doc) => (_jsxs("div", { className: styles.result_card, onClick: () => navigate(`/doc/${doc.path}`), children: [_jsx("h3", { children: doc.title }), doc.metadata.description && (_jsx("p", { children: doc.metadata.description }))] }, doc.path))) })] })) : (_jsx("div", { className: styles.empty, children: _jsxs("p", { children: ["No results found for \"", query, "\""] }) }))] })] })] }));
};
