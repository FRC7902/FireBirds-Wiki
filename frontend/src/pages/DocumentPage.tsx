import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '@components/Navbar';
import { SearchBar } from '@components/SearchBar';
import { FolderTree } from '@components/FolderTree';
import { DocumentViewer } from '@components/DocumentViewer';
import { Breadcrumbs } from '@components/Breadcrumbs';
import { useDocuments } from '@hooks/useDocuments';
import styles from './DocumentPage.module.css';

export const DocumentPage: React.FC = () => {
  const { '*': docPath } = useParams<{ '*': string }>();
  const navigate = useNavigate();
  const { tree, currentDocument, isLoading, error, loadDocument } =
    useDocuments();

  useEffect(() => {
    if (docPath) {
      loadDocument(docPath);
    }
  }, [docPath, loadDocument]);

  const generateBreadcrumbs = () => {
    if (!docPath) return [];

    const parts = docPath.split('/');
    return parts.slice(0, -1).map((part, index) => ({
      label: part,
      path: `/doc/${parts.slice(0, index + 1).join('/')}`,
    }));
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
            <FolderTree
              node={tree}
              onSelectFile={(path) => navigate(`/doc/${path}`)}
            />
          )}
        </div>
        <div className={styles.viewer}>
          <Breadcrumbs items={generateBreadcrumbs()} />
          <DocumentViewer
            document={currentDocument}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </div>
    </div>
  );
};
