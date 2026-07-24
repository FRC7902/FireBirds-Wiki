import React, { useState } from 'react';
import { TreeNode } from '@app-types/index';
import { FileItem } from './FileItem';
import styles from './FolderTree.module.css';

interface FolderTreeProps {
  node: TreeNode;
  onSelectFile?: (path: string) => void;
}

export const FolderTree: React.FC<FolderTreeProps> = ({ node, onSelectFile }) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const renderNode = (node: TreeNode, depth: number = 0): React.ReactNode => {
    const isExpanded = expandedFolders.has(node.path);

    if (node.type === 'file') {
      return (
        <FileItem
          key={node.path}
          node={node}
          depth={depth}
          onSelect={() => onSelectFile?.(node.path)}
        />
      );
    }

    return (
      <div key={node.path} className={styles.folder_item}>
        <div
          className={styles.folder_header}
          style={{ paddingLeft: `${depth * 1.5}rem` }}
          onClick={() => toggleFolder(node.path)}
        >
          <span className={styles.icon}>
            {isExpanded ? '📂' : '📁'}
          </span>
          <span className={styles.name}>{node.name}</span>
        </div>
        {isExpanded && node.children && (
          <div className={styles.children}>
            {node.children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // If this is the root node (path === ""), render children directly without a "Root" wrapper
  if (node.path === "" && node.children) {
    return <div className={styles.tree}>{node.children.map((child) => renderNode(child))}</div>;
  }

  return <div className={styles.tree}>{renderNode(node)}</div>;
};
