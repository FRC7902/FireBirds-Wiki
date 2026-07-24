import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Navbar } from '@components/Navbar';
import { SearchBar } from '@components/SearchBar';
import { Breadcrumbs } from '@components/Breadcrumbs';

import { useSearch } from '@hooks/useSearch';
import styles from './SearchPage.module.css';

export const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { results, isLoading, search } = useSearch();
  const query = searchParams.get('q') || '';

  useEffect(() => {
    if (query) {
      search(query);
    }
  }, [query, search]);

  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.main}>
        <div className={styles.sidebar}>
          <SearchBar />
          <div className={styles.results_list}>
            <h3>Search Results ({results.length})</h3>
            {results.length > 0 ? (
              <div className={styles.results}>
                {results.map((doc) => (
                  <div
                    key={doc.path}
                    className={styles.result_item}
                    onClick={() => navigate(`/doc/${doc.path}`)}
                  >
                    <h4>{doc.title}</h4>
                    {doc.metadata.description && (
                      <p>{doc.metadata.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.no_results}>
                {isLoading ? 'Searching...' : 'No results found'}
              </p>
            )}
          </div>
        </div>
        <div className={styles.viewer}>
          <Breadcrumbs
            items={[
              {
                label: 'Search Results',
                path: `/search?q=${encodeURIComponent(query)}`,
              },
            ]}
          />
          {results.length > 0 ? (
            <div className={styles.content}>
              <h2>Search Results for "{query}"</h2>
              <div className={styles.results_grid}>
                {results.map((doc) => (
                  <div
                    key={doc.path}
                    className={styles.result_card}
                    onClick={() => navigate(`/doc/${doc.path}`)}
                  >
                    <h3>{doc.title}</h3>
                    {doc.metadata.description && (
                      <p>{doc.metadata.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.empty}>
              <p>No results found for "{query}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
