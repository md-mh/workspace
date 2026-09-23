export type NodeType = "folder" | "file";

interface NodeBase {
  id: string;
  name: string;
  type: NodeType;
  parentId: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface FolderNode extends NodeBase {
  type: "folder";
}

export interface FileNode extends NodeBase {
  type: "file";
  content: string;
}

export type WorkspaceNode = FolderNode | FileNode;

/**
 * The tree is kept flat (id -> node) instead of nested children arrays.
 * Lookups, renames and deletes stay O(1)/O(n) without walking the tree,
 * and the shape survives JSON.stringify without any custom revivers.
 */
export type NodeMap = Record<string, WorkspaceNode>;

export interface WorkspaceState {
  nodes: NodeMap;
  rootId: string;
  /** Folder whose contents are shown in the main panel. */
  currentFolderId: string;
  /** File open in the editor, or null when browsing a folder. */
  openFileId: string | null;
  expandedIds: Record<string, boolean>;
}

export interface Crumb {
  id: string;
  name: string;
}
