"use client";

import { getChildCount } from "@/lib/tree";
import { Button } from "@/components/ui/button";
import {
  FolderOpenIcon,
  NewFileIcon,
  NewFolderIcon,
  PencilIcon,
  TrashIcon,
} from "@/components/ui/icons";
import { useWorkspace } from "@/components/workspace-provider";
import { useDialogs } from "./dialog-manager";
import { NodeRow } from "./node-row";

export function FolderView() {
  const { state, currentFolder, currentChildren, openFolder, openFileById } = useWorkspace();
  const { requestCreate, requestRename, requestDelete, requestReset } = useDialogs();

  const folderCount = currentChildren.filter((child) => child.type === "folder").length;
  const fileCount = currentChildren.length - folderCount;
  const isRoot = currentFolder.id === state.rootId;

  return (
    <div className="flex h-full flex-col">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-6">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <h1 className="truncate text-lg font-semibold text-slate-900">{currentFolder.name}</h1>
            {!isRoot ? (
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => requestRename(currentFolder.id)}
                  title="Rename this folder"
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  <PencilIcon className="h-4 w-4" />
                  <span className="sr-only">Rename this folder</span>
                </button>
                <button
                  type="button"
                  onClick={() => requestDelete(currentFolder.id)}
                  title="Delete this folder"
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-rose-600"
                >
                  <TrashIcon className="h-4 w-4" />
                  <span className="sr-only">Delete this folder</span>
                </button>
              </div>
            ) : null}
          </div>
          <p className="mt-0.5 text-sm text-slate-500">
            {currentChildren.length === 0
              ? "No items yet"
              : `${folderCount} ${folderCount === 1 ? "folder" : "folders"} · ${fileCount} ${
                  fileCount === 1 ? "file" : "files"
                }`}
          </p>
        </div>

        <div className="flex shrink-0 gap-2">
          <Button onClick={() => requestCreate("folder", currentFolder.id)}>
            <NewFolderIcon className="h-4 w-4" />
            New folder
          </Button>
          <Button variant="primary" onClick={() => requestCreate("file", currentFolder.id)}>
            <NewFileIcon className="h-4 w-4" />
            New file
          </Button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2 sm:px-4 sm:py-3">
        {currentChildren.length > 0 ? (
          <ul className="space-y-0.5">
            {currentChildren.map((child) => (
              <NodeRow
                key={child.id}
                node={child}
                childCount={child.type === "folder" ? getChildCount(state.nodes, child.id) : 0}
                onOpen={() =>
                  child.type === "folder" ? openFolder(child.id) : openFileById(child.id)
                }
                onRename={() => requestRename(child.id)}
                onDelete={() => requestDelete(child.id)}
              />
            ))}
          </ul>
        ) : (
          <div className="flex h-full min-h-[16rem] flex-col items-center justify-center px-6 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <FolderOpenIcon className="h-6 w-6" />
            </span>
            <p className="mt-3 text-sm font-medium text-slate-700">
              {isRoot ? "Your workspace is empty" : `“${currentFolder.name}” is empty`}
            </p>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              {isRoot
                ? "Create your first folder or text file to get started."
                : "Add a folder or a text file to fill it up."}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Button onClick={() => requestCreate("folder", currentFolder.id)}>
                <NewFolderIcon className="h-4 w-4" />
                New folder
              </Button>
              <Button variant="primary" onClick={() => requestCreate("file", currentFolder.id)}>
                <NewFileIcon className="h-4 w-4" />
                New file
              </Button>
              {isRoot ? (
                <Button variant="ghost" onClick={requestReset}>
                  Load sample workspace
                </Button>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
