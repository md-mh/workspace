/**
 * Ids are generated outside the reducer so reducing stays pure and predictable.
 */
export function createId(prefix: NodeIdPrefix = "n"): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

type NodeIdPrefix = "n" | "folder" | "file";
