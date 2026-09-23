import { Crumb, NodeMap, WorkspaceNode } from "./types";

/** Folders first, then case-insensitive name order — same rule the OS explorers use. */
export function compareNodes(a: WorkspaceNode, b: WorkspaceNode): number {
  if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
  return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" });
}

export function getChildren(nodes: NodeMap, parentId: string): WorkspaceNode[] {
  return Object.values(nodes)
    .filter((node) => node.parentId === parentId)
    .sort(compareNodes);
}

export function getChildCount(nodes: NodeMap, parentId: string): number {
  let count = 0;
  for (const id in nodes) {
    if (nodes[id].parentId === parentId) count += 1;
  }
  return count;
}

/** Ancestors of `id`, root first, including the node itself. */
export function getAncestorIds(nodes: NodeMap, id: string): string[] {
  const path: string[] = [];
  const seen = new Set<string>();
  let cursor: string | null = id;

  while (cursor && nodes[cursor] && !seen.has(cursor)) {
    seen.add(cursor);
    path.unshift(cursor);
    cursor = nodes[cursor].parentId;
  }

  return path;
}

export function getBreadcrumb(nodes: NodeMap, folderId: string): Crumb[] {
  return getAncestorIds(nodes, folderId).map((id) => ({
    id,
    name: nodes[id].name,
  }));
}

/** "Workspace / Projects / Webbly" — used by search results and tooltips. */
export function getPathLabel(nodes: NodeMap, id: string, separator = " / "): string {
  return getAncestorIds(nodes, id)
    .map((nodeId) => nodes[nodeId].name)
    .join(separator);
}

/** The node plus everything nested below it. */
export function collectSubtreeIds(nodes: NodeMap, rootId: string): string[] {
  const collected: string[] = [];
  const queue: string[] = [rootId];
  // A node that somehow ends up its own ancestor would loop forever otherwise.
  const seen = new Set<string>();

  while (queue.length > 0) {
    const current = queue.shift() as string;
    if (!nodes[current] || seen.has(current)) continue;

    seen.add(current);
    collected.push(current);

    for (const id in nodes) {
      if (nodes[id].parentId === current) queue.push(id);
    }
  }

  return collected;
}

export interface SubtreeSummary {
  folders: number;
  files: number;
}

/** Counts used by the delete confirmation, so the warning is specific. */
export function summariseSubtree(nodes: NodeMap, rootId: string): SubtreeSummary {
  const summary: SubtreeSummary = { folders: 0, files: 0 };

  for (const id of collectSubtreeIds(nodes, rootId)) {
    if (id === rootId) continue;
    if (nodes[id].type === "folder") summary.folders += 1;
    else summary.files += 1;
  }

  return summary;
}

/**
 * Walks a pre-computed ancestor chain (deepest first) and returns the first
 * folder that still exists. Used right after a delete, when the ids we were
 * sitting on may already be gone from the map.
 */
export function firstExistingFolder(
  nodes: NodeMap,
  candidateIds: string[],
  fallbackId: string,
): string {
  for (const id of candidateIds) {
    const node = nodes[id];
    if (node && node.type === "folder") return id;
  }
  return fallbackId;
}
