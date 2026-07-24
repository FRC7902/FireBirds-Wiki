import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@components/Navbar';
import { SearchBar } from '@components/SearchBar';
import { FolderTree } from '@components/FolderTree';
import { DocumentViewer } from '@components/DocumentViewer';
import { useDocuments } from '@hooks/useDocuments';
import styles from './HomePage.module.css';

export const HomePage: React.FC = () => {
  const { tree, currentDocument, isLoading, error, loadDocument } =
    useDocuments();
  const navigate = useNavigate();

  const handleFileSelect = (path: string) => {
    loadDocument(path);
  };

  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.main}>
        <div className={styles.sidebar}>
          <SearchBar
            onSearch={(query) => navigate(`/search?q=${encodeURIComponent(query)}`)}
          />
          {tree && (
            <FolderTree node={tree} onSelectFile={handleFileSelect} />
          )}
        </div>
        <DocumentViewer
          document={currentDocument}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </div>
  );
};
