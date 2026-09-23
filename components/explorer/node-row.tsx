"use client";

import { cn } from "@/lib/cn";
import { formatCharacterCount, formatRelativeTime } from "@/lib/format";
import { WorkspaceNode } from "@/lib/types";
import { FileIcon, FolderIcon, PencilIcon, TrashIcon } from "@/components/ui/icons";

interface NodeRowProps {
  node: WorkspaceNode;
  /** Number of direct children, only used for folders. */
  childCount?: number;
  onOpen: () => void;
  onRename: () => void;
  onDelete: () => void;
}

export function NodeRow({ node, childCount = 0, onOpen, onRename, onDelete }: NodeRowProps) {
  const isFolder = node.type === "folder";

  const meta = isFolder
    ? childCount === 0
      ? "Empty folder"
      : `${childCount} ${childCount === 1 ? "item" : "items"}`
    : formatCharacterCount(node.content);

  return (
    <li className="group relative flex items-center gap-2 rounded-xl px-2 transition hover:bg-slate-50">
      <button
        type="button"
        onClick={onOpen}
        onKeyDown={(event) => {
          // Shortcuts that match what most file managers do on a selected row.
          if (event.key === "F2") {
            event.preventDefault();
            onRename();
          } else if (event.key === "Delete") {
            event.preventDefault();
            onDelete();
          }
        }}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-lg py-2.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
      >
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            isFolder ? "bg-indigo-50 text-indigo-600" : "bg-slate-100 text-slate-500",
          )}
        >
          {isFolder ? <FolderIcon className="h-5 w-5" /> : <FileIcon className="h-5 w-5" />}
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-slate-800">{node.name}</span>
          <span className="block truncate text-xs text-slate-400">{meta}</span>
        </span>
      </button>

      <span className="hidden shrink-0 text-xs text-slate-400 md:block">
        {formatRelativeTime(node.updatedAt)}
      </span>

      <div className="flex shrink-0 items-center gap-0.5 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
        <button
          type="button"
          onClick={onRename}
          title={`Rename ${node.name}`}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-slate-700 hover:shadow-sm"
        >
          <PencilIcon className="h-4 w-4" />
          <span className="sr-only">Rename {node.name}</span>
        </button>
        <button
          type="button"
          onClick={onDelete}
          title={`Delete ${node.name}`}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-rose-600 hover:shadow-sm"
        >
          <TrashIcon className="h-4 w-4" />
          <span className="sr-only">Delete {node.name}</span>
        </button>
      </div>
    </li>
  );
}
