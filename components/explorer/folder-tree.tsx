"use client";

import { useMemo } from "react";

import { cn } from "@/lib/cn";
import { getChildren, getPathLabel } from "@/lib/tree";
import { ChevronRightIcon, FolderIcon, FolderOpenIcon } from "@/components/ui/icons";
import { useWorkspace } from "@/components/workspace-provider";

interface FolderTreeProps {
  /** Called after a folder is opened, so the mobile drawer can close itself. */
  onNavigate?: () => void;
}

export function FolderTree({ onNavigate }: FolderTreeProps) {
  const { state } = useWorkspace();

  return (
    <ul role="tree" aria-label="Workspace folders" className="space-y-0.5">
      <TreeItem nodeId={state.rootId} depth={0} onNavigate={onNavigate} />
    </ul>
  );
}

interface TreeItemProps {
  nodeId: string;
  depth: number;
  onNavigate?: () => void;
}

function TreeItem({ nodeId, depth, onNavigate }: TreeItemProps) {
  const { state, openFolder, toggleFolder } = useWorkspace();
  const node = state.nodes[nodeId];

  const { subfolders, fileCount } = useMemo(() => {
    const children = getChildren(state.nodes, nodeId);
    return {
      subfolders: children.filter((child) => child.type === "folder"),
      fileCount: children.filter((child) => child.type === "file").length,
    };
  }, [state.nodes, nodeId]);

  if (!node || node.type !== "folder") return null;

  const isExpanded = Boolean(state.expandedIds[nodeId]);
  const isCurrent = state.currentFolderId === nodeId;
  const hasSubfolders = subfolders.length > 0;

  return (
    <li
      role="treeitem"
      aria-level={depth + 1}
      aria-selected={isCurrent}
      aria-expanded={hasSubfolders ? isExpanded : undefined}
    >
      <div
        className={cn(
          "group flex items-center rounded-lg pr-1.5 transition",
          isCurrent ? "bg-indigo-50 text-indigo-900" : "text-slate-700 hover:bg-slate-100",
        )}
        style={{ paddingLeft: `${depth * 14}px` }}
      >
        {hasSubfolders ? (
          <button
            type="button"
            onClick={() => toggleFolder(nodeId)}
            aria-label={`${isExpanded ? "Collapse" : "Expand"} ${node.name}`}
            className="flex h-7 w-6 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:text-slate-700"
          >
            <ChevronRightIcon
              className={cn("h-3.5 w-3.5 transition-transform", isExpanded && "rotate-90")}
            />
          </button>
        ) : (
          <span className="h-7 w-6 shrink-0" aria-hidden="true" />
        )}

        <button
          type="button"
          onClick={() => {
            openFolder(nodeId);
            onNavigate?.();
          }}
          title={getPathLabel(state.nodes, nodeId)}
          className="flex h-7 min-w-0 flex-1 items-center gap-1.5 rounded-md text-left text-sm outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
        >
          {isCurrent || isExpanded ? (
            <FolderOpenIcon
              className={cn("h-4 w-4 shrink-0", isCurrent ? "text-indigo-600" : "text-slate-400")}
            />
          ) : (
            <FolderIcon className="h-4 w-4 shrink-0 text-slate-400" />
          )}
          <span className={cn("truncate", isCurrent && "font-medium")}>{node.name}</span>
        </button>

        {fileCount > 0 ? (
          <span
            className={cn(
              "ml-1 shrink-0 rounded-full px-1.5 py-0.5 text-[11px] leading-none tabular-nums",
              isCurrent ? "text-indigo-500" : "text-slate-400",
            )}
            title={`${fileCount} ${fileCount === 1 ? "file" : "files"}`}
          >
            {fileCount}
          </span>
        ) : null}
      </div>

      {hasSubfolders && isExpanded ? (
        <ul role="group" className="mt-0.5 space-y-0.5">
          {subfolders.map((child) => (
            <TreeItem key={child.id} nodeId={child.id} depth={depth + 1} onNavigate={onNavigate} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}
