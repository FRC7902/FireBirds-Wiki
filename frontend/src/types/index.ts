export interface FileMetadata {
  title: string;
  description?: string;
  tags?: string[];
  [key: string]: any;
}

export interface Document {
  path: string;
  metadata: FileMetadata;
  content: string;
  title: string;
}

export interface TreeNode {
  name: string;
  type: "file" | "folder";
  path: string;
  children?: TreeNode[];
  title?: string;
  description?: string;
}

export interface SearchResult extends Document {}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}
