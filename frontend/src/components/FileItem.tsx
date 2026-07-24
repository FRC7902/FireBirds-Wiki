import React from 'react';
import { TreeNode } from '@app-types/index';
import styles from './FileItem.module.css';

interface FileItemProps {
  node: TreeNode;
  depth: number;
  onSelect?: () => void;
}

export const FileItem: React.FC<FileItemProps> = ({ node, depth, onSelect }) => {
  return (
    <div
      className={styles.file_item}
      style={{ paddingLeft: `${depth * 1.5}rem` }}
      onClick={onSelect}
    >
      <span className={styles.icon}>📄</span>
      <div className={styles.content}>
        <div className={styles.title}>{node.title || node.name}</div>
        {node.description && (
          <div className={styles.description}>{node.description}</div>
        )}
      </div>
    </div>
  );
};
