"use client";

import { useMemo } from "react";

import { NewFolderIcon, RefreshIcon } from "@/components/ui/icons";
import { useWorkspace } from "@/components/workspace-provider";
import { useDialogs } from "./dialog-manager";
import { FolderTree } from "./folder-tree";

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const { state, currentFolder } = useWorkspace();
  const { requestCreate, requestReset } = useDialogs();

  const totals = useMemo(() => {
    let folders = 0;
    let files = 0;

    for (const id in state.nodes) {
      if (id === state.rootId) continue;
      if (state.nodes[id].type === "folder") folders += 1;
      else files += 1;
    }

    return { folders, files };
  }, [state.nodes, state.rootId]);

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-2.5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Folders</h2>
        <button
          type="button"
          onClick={() => requestCreate("folder", currentFolder.id)}
          title={`New folder in ${currentFolder.name}`}
          className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <NewFolderIcon className="h-4 w-4" />
          <span className="sr-only">New folder</span>
        </button>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
        <FolderTree onNavigate={onNavigate} />
      </nav>

      <div className="border-t border-slate-100 px-3 py-2.5">
        <p className="text-[11px] text-slate-400">
          {totals.folders} {totals.folders === 1 ? "folder" : "folders"} · {totals.files}{" "}
          {totals.files === 1 ? "file" : "files"}
        </p>
        <button
          type="button"
          onClick={requestReset}
          className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-slate-500 transition hover:text-slate-800"
        >
          <RefreshIcon className="h-3.5 w-3.5" />
          Reset workspace
        </button>
      </div>
    </div>
  );
}
