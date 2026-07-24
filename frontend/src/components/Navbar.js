import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import styles from './Navbar.module.css';
export const Navbar = () => {
    return (_jsx("nav", { className: styles.navbar, children: _jsxs("div", { className: styles.container, children: [_jsx(Link, { to: "/", className: styles.logo, children: _jsx("h1", { children: "\uD83D\uDCDA 7902 Wiki" }) }), _jsx("div", { className: styles.nav_items, children: _jsx("a", { href: "https://github.com", target: "_blank", rel: "noopener noreferrer", children: "GitHub" }) })] }) }));
};
