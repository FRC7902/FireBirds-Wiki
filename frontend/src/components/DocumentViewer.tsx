import React from 'react';
import styles from './DocumentViewer.module.css';
import { PdfRenderer } from './PdfRenderer';

// const styles: Record<string, string> = {
//   viewer: 'viewer',
//   error: 'error',
//   empty: 'empty',
//   metadata: 'metadata',
//   tags: 'tags',
//   tag: 'tag',
//   content: 'content',
//   description: 'description',
//   markdown: 'markdown',
// };

interface Document {
  title: string;
  content?: string;
  metadata: {
    tags?: string[];
    description?: string;
    pdf_url?: string;
    source_file_id?: string;
  };
}

interface DocumentViewerProps {
  document: Document | null;
  isLoading?: boolean;
  error?: string | null;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  isLoading = false,
  error = null,
}) => {
  if (isLoading) {
    return <div className={styles.viewer}>Loading...</div>;
  }

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  if (!document) {
    return (
      <div className={styles.empty}>
        <p>Select a document to view</p>
      </div>
    );
  }

  return (
    <div className={styles.viewer}>
      <div className={styles.metadata}>
        {document.metadata.tags && document.metadata.tags.length > 0 && (
          <div className={styles.tags}>
            {document.metadata.tags.map((tag) => (
              <span key={tag} className={styles.tag}>
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className={styles.content}>
        <h1>{document.title}</h1>
        {document.metadata.pdf_url && (
          <PdfRenderer url={document.metadata.pdf_url} fileId={document.metadata.source_file_id} />
        )}
        {document.metadata.description && (
          <p className={styles.description}>{document.metadata.description}</p>
        )}
        <div className={styles.markdown}>
          {document.content || 'No content available'}
        </div>
      </div>
    </div>
  );
};
