import { getPathLabel } from "./tree";
import { NodeMap, WorkspaceNode } from "./types";

export type MatchField = "name" | "content";

export interface SearchResult {
  node: WorkspaceNode;
  /** Where the hit came from — names rank above content hits. */
  matchedIn: MatchField;
  /** "Workspace / Projects / Webbly" for the containing folder. */
  parentPath: string;
  /** Short excerpt around the first content hit. */
  snippet?: string;
}

const SNIPPET_PADDING = 32;
const MAX_RESULTS = 100;

/**
 * Searches every node in the workspace, regardless of nesting depth — the flat
 * node map means no recursive walk is needed here.
 */
export function searchWorkspace(nodes: NodeMap, rawQuery: string, rootId: string): SearchResult[] {
  const query = rawQuery.trim().toLowerCase();
  if (query.length === 0) return [];

  const results: SearchResult[] = [];

  for (const id in nodes) {
    const node = nodes[id];
    if (node.id === rootId) continue;

    const nameHit = node.name.toLowerCase().includes(query);

    if (nameHit) {
      results.push({
        node,
        matchedIn: "name",
        parentPath: node.parentId ? getPathLabel(nodes, node.parentId) : "",
      });
      continue;
    }

    if (node.type === "file") {
      const index = node.content.toLowerCase().indexOf(query);
      if (index !== -1) {
        results.push({
          node,
          matchedIn: "content",
          parentPath: node.parentId ? getPathLabel(nodes, node.parentId) : "",
          snippet: buildSnippet(node.content, index, query.length),
        });
      }
    }
  }

  results.sort((a, b) => {
    if (a.matchedIn !== b.matchedIn) return a.matchedIn === "name" ? -1 : 1;
    if (a.node.type !== b.node.type) return a.node.type === "folder" ? -1 : 1;
    return a.node.name.localeCompare(b.node.name, undefined, { sensitivity: "base" });
  });

  return results.slice(0, MAX_RESULTS);
}

function buildSnippet(content: string, index: number, queryLength: number): string {
  const start = Math.max(0, index - SNIPPET_PADDING);
  const end = Math.min(content.length, index + queryLength + SNIPPET_PADDING);
  const excerpt = content.slice(start, end).replace(/\s+/g, " ").trim();

  return `${start > 0 ? "…" : ""}${excerpt}${end < content.length ? "…" : ""}`;
}

/** Splits a label into matched / unmatched chunks so the UI can highlight hits. */
export function splitOnMatch(text: string, rawQuery: string): { text: string; match: boolean }[] {
  const query = rawQuery.trim();
  if (query.length === 0) return [{ text, match: false }];

  const parts: { text: string; match: boolean }[] = [];
  const haystack = text.toLowerCase();
  const needle = query.toLowerCase();
  let cursor = 0;

  while (cursor < text.length) {
    const index = haystack.indexOf(needle, cursor);
    if (index === -1) {
      parts.push({ text: text.slice(cursor), match: false });
      break;
    }

    if (index > cursor) parts.push({ text: text.slice(cursor, index), match: false });
    parts.push({ text: text.slice(index, index + needle.length), match: true });
    cursor = index + needle.length;
  }

  return parts;
}
