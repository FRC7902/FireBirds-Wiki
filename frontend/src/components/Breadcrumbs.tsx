import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Breadcrumbs.module.css';

interface BreadcrumbItem {
  label: string;
  path: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  const navigate = useNavigate();

  if (items.length === 0) {
    return null;
  }

  return (
    <nav className={styles.breadcrumbs}>
      <button 
        onClick={() => navigate('/')}
        className={styles.item}
      >
        🏠 Home
      </button>
      {items.map((item, index) => (
        <React.Fragment key={item.path}>
          <span className={styles.separator}>/</span>
          <button
            onClick={() => navigate(item.path)}
            className={styles.item}
          >
            {item.label}
          </button>
        </React.Fragment>
      ))}
    </nav>
  );
};
