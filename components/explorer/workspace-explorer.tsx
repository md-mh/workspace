"use client";

import { useCallback, useDeferredValue, useState } from "react";

import { CloseIcon, FolderOpenIcon, SearchIcon } from "@/components/ui/icons";
import { useWorkspace } from "@/components/workspace-provider";
import { Breadcrumbs } from "./breadcrumbs";
import { DialogManager } from "./dialog-manager";
import { FileEditor } from "./file-editor";
import { FolderView } from "./folder-view";
import { SearchPanel } from "./search-panel";
import { Sidebar } from "./sidebar";
import { UnsavedChangesDialog } from "./unsaved-changes-dialog";

export function WorkspaceExplorer() {
  const { hydrated } = useWorkspace();

  if (!hydrated) return <ExplorerSkeleton />;

  return (
    <DialogManager>
      <ExplorerLayout />
      <UnsavedChangesDialog />
    </DialogManager>
  );
}

function ExplorerLayout() {
  const { breadcrumb, openFile, openFolder } = useWorkspace();
  const [query, setQuery] = useState("");

  // Searching stays responsive on large trees: typing is never blocked by the
  // result list re-rendering.
  const deferredQuery = useDeferredValue(query);
  const isSearching = deferredQuery.trim().length > 0;

  const clearSearch = useCallback(() => setQuery(""), []);

  return (
    <div className="flex h-dvh min-h-[32rem] flex-col bg-slate-50 text-slate-800">
      <header className="flex shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-3 py-2.5 sm:px-5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <FolderOpenIcon className="h-4 w-4" />
          </span>
          <span className="hidden min-w-0 sm:block">
            <span className="block truncate text-sm font-semibold leading-tight text-slate-900">
              Mini Workspace Explorer
            </span>
            <span className="block truncate text-[11px] leading-tight text-slate-400">
              Everything is stored in this browser
            </span>
          </span>
        </div>

        <div className="ml-auto flex w-full max-w-md items-center">
          <div className="relative w-full">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  clearSearch();
                  event.currentTarget.blur();
                }
              }}
              placeholder="Search folders and files…"
              aria-label="Search the workspace"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-9 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />
            {query.length > 0 ? (
              <button
                type="button"
                onClick={clearSearch}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
              >
                <CloseIcon className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 lg:block xl:w-72">
          <Sidebar />
        </aside>

        <main className="flex min-w-0 flex-1 flex-col bg-white">
          <div className="flex shrink-0 items-center gap-2 overflow-x-auto border-b border-slate-100 px-3 py-2 sm:px-6">
            <Breadcrumbs
              crumbs={breadcrumb}
              onNavigate={openFolder}
              trailing={openFile && !isSearching ? openFile.name : undefined}
            />
          </div>

          <div className="min-h-0 flex-1">
            {isSearching ? (
              <SearchPanel query={deferredQuery} onClear={clearSearch} />
            ) : openFile ? (
              <FileEditor file={openFile} />
            ) : (
              <FolderView />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function ExplorerSkeleton() {
  return (
    <div className="flex h-dvh flex-col bg-slate-50">
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-5">
        <div className="h-8 w-8 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-4 w-44 animate-pulse rounded bg-slate-200" />
        <div className="ml-auto h-9 w-full max-w-md animate-pulse rounded-lg bg-slate-100" />
      </div>
      <div className="flex min-h-0 flex-1">
        <div className="hidden w-64 shrink-0 space-y-2 border-r border-slate-200 bg-white p-4 lg:block">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="h-6 animate-pulse rounded bg-slate-100" />
          ))}
        </div>
        <div className="flex-1 space-y-2 bg-white p-6">
          <div className="h-6 w-40 animate-pulse rounded bg-slate-200" />
          {[...Array(4)].map((_, index) => (
            <div key={index} className="h-12 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      </div>
    </div>
  );
}
