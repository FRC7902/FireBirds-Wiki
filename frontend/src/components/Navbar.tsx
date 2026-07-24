import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Navbar.module.css';

export const Navbar: React.FC = () => {
  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          <h1>📚 7902 Wiki</h1>
        </Link>
        <div className={styles.nav_items}>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </div>
      </div>
    </nav>
  );
};
