import { collectSubtreeIds, firstExistingFolder, getAncestorIds } from "./tree";
import { NodeMap, WorkspaceNode, WorkspaceState } from "./types";

export type WorkspaceAction =
  | { type: "hydrate"; state: WorkspaceState }
  | { type: "open-folder"; folderId: string }
  | { type: "open-file"; fileId: string }
  | { type: "close-file" }
  | { type: "toggle-folder"; folderId: string }
  | { type: "reveal"; nodeId: string }
  | { type: "create-node"; node: WorkspaceNode }
  | { type: "rename-node"; id: string; name: string; timestamp: number }
  | { type: "delete-node"; id: string }
  | { type: "save-file"; id: string; content: string; timestamp: number }
  | { type: "replace"; state: WorkspaceState };

export function workspaceReducer(state: WorkspaceState, action: WorkspaceAction): WorkspaceState {
  switch (action.type) {
    case "hydrate":
    case "replace":
      return action.state;

    case "open-folder": {
      const folder = state.nodes[action.folderId];
      if (!folder || folder.type !== "folder") return state;

      return {
        ...state,
        currentFolderId: folder.id,
        openFileId: null,
        expandedIds: expandAncestors(state, folder.id, true),
      };
    }

    case "open-file": {
      const file = state.nodes[action.fileId];
      if (!file || file.type !== "file") return state;

      return {
        ...state,
        currentFolderId: file.parentId ?? state.currentFolderId,
        openFileId: file.id,
        expandedIds: file.parentId
          ? expandAncestors(state, file.parentId, true)
          : state.expandedIds,
      };
    }

    case "close-file":
      return state.openFileId === null ? state : { ...state, openFileId: null };

    case "toggle-folder": {
      const folder = state.nodes[action.folderId];
      if (!folder || folder.type !== "folder") return state;

      const expandedIds = { ...state.expandedIds };
      if (expandedIds[action.folderId]) delete expandedIds[action.folderId];
      else expandedIds[action.folderId] = true;

      return { ...state, expandedIds };
    }

    case "reveal": {
      const node = state.nodes[action.nodeId];
      if (!node) return state;

      if (node.type === "folder") {
        return {
          ...state,
          currentFolderId: node.id,
          openFileId: null,
          expandedIds: expandAncestors(state, node.id, true),
        };
      }

      const parentId = node.parentId ?? state.rootId;
      return {
        ...state,
        currentFolderId: parentId,
        openFileId: node.id,
        expandedIds: expandAncestors(state, parentId, true),
      };
    }

    case "create-node": {
      const { node } = action;
      const parentId = node.parentId;
      if (!parentId || state.nodes[parentId]?.type !== "folder") return state;

      return {
        ...state,
        nodes: { ...state.nodes, [node.id]: node },
        expandedIds: { ...expandAncestors(state, parentId, true) },
      };
    }

    case "rename-node": {
      const node = state.nodes[action.id];
      const name = action.name.trim();
      if (!node || name.length === 0 || node.name === name) return state;

      return {
        ...state,
        nodes: {
          ...state.nodes,
          [node.id]: { ...node, name, updatedAt: action.timestamp },
        },
      };
    }

    case "delete-node": {
      const node = state.nodes[action.id];
      // The root folder is the workspace itself and cannot be removed.
      if (!node || node.id === state.rootId) return state;

      const removed = new Set(collectSubtreeIds(state.nodes, node.id));
      // Where to land afterwards, worked out before the ids disappear.
      const fallbackChain = node.parentId
        ? [...getAncestorIds(state.nodes, node.parentId)].reverse()
        : [state.rootId];

      const nodes: NodeMap = {};
      for (const id in state.nodes) {
        if (!removed.has(id)) nodes[id] = state.nodes[id];
      }

      const expandedIds: Record<string, boolean> = {};
      for (const id in state.expandedIds) {
        if (!removed.has(id)) expandedIds[id] = true;
      }

      const currentFolderId = removed.has(state.currentFolderId)
        ? firstExistingFolder(nodes, fallbackChain, state.rootId)
        : state.currentFolderId;

      const openFileId =
        state.openFileId && removed.has(state.openFileId) ? null : state.openFileId;

      return { ...state, nodes, expandedIds, currentFolderId, openFileId };
    }

    case "save-file": {
      const node = state.nodes[action.id];
      if (!node || node.type !== "file") return state;
      if (node.content === action.content) return state;

      return {
        ...state,
        nodes: {
          ...state.nodes,
          [node.id]: { ...node, content: action.content, updatedAt: action.timestamp },
        },
      };
    }

    default:
      return state;
  }
}

/** Keeps every folder on the way down to `folderId` open in the sidebar. */
function expandAncestors(
  state: WorkspaceState,
  folderId: string,
  includeSelf: boolean,
): Record<string, boolean> {
  const expandedIds = { ...state.expandedIds };
  const chain = getAncestorIds(state.nodes, folderId);

  for (const id of chain) {
    if (!includeSelf && id === folderId) continue;
    expandedIds[id] = true;
  }

  return expandedIds;
}
