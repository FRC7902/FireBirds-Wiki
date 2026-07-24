import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  onSearch?: (query: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      if (onSearch) {
        onSearch(query);
      }
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form className={styles.searchbar} onSubmit={handleSearch}>
      <input
        type="text"
        placeholder="Search documents..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className={styles.input}
      />
      <button type="submit" className={styles.button}>
        🔍
      </button>
    </form>
  );
};
