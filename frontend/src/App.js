import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { HomePage } from '@pages/HomePage';
import { DocumentPage } from '@pages/DocumentPage';
import { SearchPage } from '@pages/SearchPage';
function RedirectHandler() {
    const navigate = useNavigate();
    useEffect(() => {
        const redirect = sessionStorage.getItem('redirect');
        if (redirect) {
            sessionStorage.removeItem('redirect');
            navigate(redirect, { replace: true });
        }
    }, [navigate]);
    return null;
}
function App() {
    return (_jsxs(Router, { children: [_jsx(RedirectHandler, {}), _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(HomePage, {}) }), _jsx(Route, { path: "/doc/*", element: _jsx(DocumentPage, {}) }), _jsx(Route, { path: "/search", element: _jsx(SearchPage, {}) })] })] }));
}
export default App;
