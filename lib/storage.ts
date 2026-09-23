import { ROOT_ID } from "./seed";
import { NodeMap, WorkspaceNode, WorkspaceState } from "./types";

const STORAGE_KEY = "webbly.workspace.v1";

interface StoredPayload {
  version: number;
  savedAt: number;
  state: WorkspaceState;
}

const CURRENT_VERSION = 1;

export function loadState(): WorkspaceState | null {
  if (typeof window === "undefined") return null;

  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    // Storage can be blocked entirely (private mode, disabled cookies).
    return null;
  }

  if (!raw) return null;

  try {
    const payload = JSON.parse(raw) as Partial<StoredPayload>;
    if (!payload || payload.version !== CURRENT_VERSION || !payload.state) return null;
    return sanitiseState(payload.state);
  } catch {
    return null;
  }
}

export function saveState(state: WorkspaceState): void {
  if (typeof window === "undefined") return;

  const payload: StoredPayload = {
    version: CURRENT_VERSION,
    savedAt: Date.now(),
    state,
  };

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    // Most likely the 5 MB quota. The app keeps working from memory.
    console.warn("Workspace could not be saved to localStorage.", error);
  }
}

export function clearStoredState(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing useful to do if removal fails.
  }
}

/**
 * Anything can end up in localStorage — an older build, a half-written value,
 * or a hand-edited entry. Rather than trusting it, the payload is rebuilt from
 * the parts that still make sense and anything unreachable is dropped.
 */
function sanitiseState(input: unknown): WorkspaceState | null {
  if (typeof input !== "object" || input === null) return null;

  const candidate = input as Partial<WorkspaceState>;
  if (typeof candidate.nodes !== "object" || candidate.nodes === null) return null;

  const rootId = typeof candidate.rootId === "string" ? candidate.rootId : ROOT_ID;
  const parsed: NodeMap = {};

  for (const [id, value] of Object.entries(candidate.nodes)) {
    const node = parseNode(id, value);
    if (node) parsed[id] = node;
  }

  const root = parsed[rootId];
  if (!root || root.type !== "folder") return null;
  root.parentId = null;

  const nodes = keepReachable(parsed, rootId);

  const currentFolderId =
    typeof candidate.currentFolderId === "string" &&
    nodes[candidate.currentFolderId]?.type === "folder"
      ? candidate.currentFolderId
      : rootId;

  const openFileId =
    typeof candidate.openFileId === "string" && nodes[candidate.openFileId]?.type === "file"
      ? candidate.openFileId
      : null;

  const expandedIds: Record<string, boolean> = { [rootId]: true };
  if (typeof candidate.expandedIds === "object" && candidate.expandedIds !== null) {
    for (const [id, expanded] of Object.entries(candidate.expandedIds)) {
      if (expanded === true && nodes[id]?.type === "folder") expandedIds[id] = true;
    }
  }

  return { nodes, rootId, currentFolderId, openFileId, expandedIds };
}

function parseNode(id: string, value: unknown): WorkspaceNode | null {
  if (typeof value !== "object" || value === null) return null;

  const node = value as Record<string, unknown>;
  if (node.id !== id) return null;
  if (typeof node.name !== "string" || node.name.trim().length === 0) return null;
  if (node.type !== "folder" && node.type !== "file") return null;
  if (node.parentId !== null && typeof node.parentId !== "string") return null;

  const createdAt = typeof node.createdAt === "number" ? node.createdAt : Date.now();
  const updatedAt = typeof node.updatedAt === "number" ? node.updatedAt : createdAt;

  if (node.type === "folder") {
    return {
      id,
      name: node.name,
      type: "folder",
      parentId: node.parentId as string | null,
      createdAt,
      updatedAt,
    };
  }

  return {
    id,
    name: node.name,
    type: "file",
    parentId: node.parentId as string | null,
    content: typeof node.content === "string" ? node.content : "",
    createdAt,
    updatedAt,
  };
}

/** Drops orphans and any cycle that would otherwise be invisible but persisted. */
function keepReachable(nodes: NodeMap, rootId: string): NodeMap {
  const reachable: NodeMap = { [rootId]: nodes[rootId] };
  const queue = [rootId];

  while (queue.length > 0) {
    const parentId = queue.shift() as string;
    for (const id in nodes) {
      if (id === rootId || reachable[id]) continue;
      if (nodes[id].parentId === parentId) {
        reachable[id] = nodes[id];
        if (nodes[id].type === "folder") queue.push(id);
      }
    }
  }

  return reachable;
}
