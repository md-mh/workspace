import { NodeMap, NodeType } from "./types";

export const MAX_NAME_LENGTH = 60;

/** Characters most desktop file systems reject — kept out for consistency. */
const ILLEGAL_CHARACTERS = /[\/:*?"<>|]/;

interface ValidateOptions {
  name: string;
  type: NodeType;
  parentId: string;
  nodes: NodeMap;
  /** Id being renamed, so an item is never a duplicate of itself. */
  ignoreId?: string;
}

/**
 * Returns an error message, or null when the name can be used.
 * Duplicate checks are case-insensitive: "Notes.txt" and "notes.txt" would be
 * confusing siblings even though they are technically different strings.
 */
export function validateName({
  name,
  type,
  parentId,
  nodes,
  ignoreId,
}: ValidateOptions): string | null {
  const trimmed = name.trim();

  if (trimmed.length === 0) {
    return `Please enter a ${type} name.`;
  }

  if (trimmed.length > MAX_NAME_LENGTH) {
    return `Names can be at most ${MAX_NAME_LENGTH} characters.`;
  }

  if (ILLEGAL_CHARACTERS.test(trimmed)) {
    return 'A name cannot contain  / : * ? " < > or |';
  }

  if (trimmed === "." || trimmed === "..") {
    return "That name is reserved.";
  }

  const duplicate = Object.values(nodes).find(
    (node) =>
      node.parentId === parentId &&
      node.id !== ignoreId &&
      node.name.toLowerCase() === trimmed.toLowerCase(),
  );

  if (duplicate) {
    const label = duplicate.type === "folder" ? "folder" : "file";
    return `A ${label} named "${duplicate.name}" already exists here.`;
  }

  return null;
}

/** Text files keep a .txt extension unless the user typed one themselves. */
export function withTextExtension(name: string): string {
  const trimmed = name.trim();
  return /\.[a-z0-9]+$/i.test(trimmed) ? trimmed : `${trimmed}.txt`;
}
