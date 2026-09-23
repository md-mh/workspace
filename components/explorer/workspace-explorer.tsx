"use client";

import { FolderOpenIcon } from "@/components/ui/icons";
import { useWorkspace } from "@/components/workspace-provider";
import { Breadcrumbs } from "./breadcrumbs";
import { DialogManager } from "./dialog-manager";
import { FileEditor } from "./file-editor";
import { FolderView } from "./folder-view";
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
              trailing={openFile ? openFile.name : undefined}
            />
          </div>

          <div className="min-h-0 flex-1">
            {openFile ? <FileEditor file={openFile} /> : <FolderView />}
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
