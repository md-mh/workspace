"use client";

import { useEffect } from "react";

import { cn } from "@/lib/cn";
import { countLines, countWords, formatRelativeTime } from "@/lib/format";
import { FileNode } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, PencilIcon, SaveIcon, TrashIcon } from "@/components/ui/icons";
import { useToast } from "@/components/ui/toast";
import { useWorkspace } from "@/components/workspace-provider";
import { useDialogs } from "./dialog-manager";

export function FileEditor({ file }: { file: FileNode }) {
  const { draftContent, isDirty, updateDraft, saveDraft, revertDraft, closeFile } = useWorkspace();
  const { requestRename, requestDelete } = useDialogs();
  const { notify } = useToast();

  const content = draftContent ?? file.content;

  // Ctrl/Cmd + S saves from anywhere in the editor, not just the textarea.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "s") return;
      event.preventDefault();
      if (!isDirty) return;
      saveDraft();
      notify(`“${file.name}” saved`);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDirty, saveDraft, notify, file.name]);

  const handleSave = () => {
    if (!isDirty) return;
    saveDraft();
    notify(`“${file.name}” saved`);
  };

  return (
    <div className="flex h-full flex-col">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={closeFile}
            title="Back to folder"
            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span className="sr-only">Back to folder</span>
          </button>

          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <h1 className="truncate text-base font-semibold text-slate-900">{file.name}</h1>
              {isDirty ? (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 ring-1 ring-inset ring-amber-100">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  Unsaved
                </span>
              ) : null}
            </div>
            <p className="truncate text-xs text-slate-400">
              Saved {formatRelativeTime(file.updatedAt)}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => requestRename(file.id)}
            title="Rename this file"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <PencilIcon className="h-4 w-4" />
            <span className="sr-only">Rename this file</span>
          </button>
          <button
            type="button"
            onClick={() => requestDelete(file.id)}
            title="Delete this file"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-rose-600"
          >
            <TrashIcon className="h-4 w-4" />
            <span className="sr-only">Delete this file</span>
          </button>

          {isDirty ? (
            <Button onClick={revertDraft} className="ml-1">
              Revert
            </Button>
          ) : null}

          <Button variant="primary" onClick={handleSave} disabled={!isDirty} className="ml-1">
            <SaveIcon className="h-4 w-4" />
            Save
          </Button>
        </div>
      </header>

      <div className="min-h-0 flex-1 px-3 py-3 sm:px-5 sm:py-4">
        <label htmlFor="file-content" className="sr-only">
          Contents of {file.name}
        </label>
        <textarea
          id="file-content"
          value={content}
          onChange={(event) => updateDraft(event.target.value)}
          spellCheck={false}
          placeholder="Start typing…"
          className={cn(
            "h-full w-full resize-none rounded-xl border bg-white p-4 font-mono text-[13px] leading-relaxed text-slate-800 shadow-sm outline-none transition",
            "placeholder:text-slate-300 focus:ring-2",
            isDirty
              ? "border-amber-200 focus:border-amber-300 focus:ring-amber-100"
              : "border-slate-200 focus:border-indigo-400 focus:ring-indigo-100",
          )}
        />
      </div>

      <footer className="flex items-center justify-between gap-3 border-t border-slate-100 px-4 py-2 text-xs text-slate-400 sm:px-6">
        <span className="tabular-nums">
          {countLines(content)} lines · {countWords(content)} words · {content.length} characters
        </span>
        <span className="hidden sm:block">
          Press{" "}
          <kbd className="rounded bg-slate-100 px-1 py-0.5 font-sans text-slate-500">Ctrl</kbd> +{" "}
          <kbd className="rounded bg-slate-100 px-1 py-0.5 font-sans text-slate-500">S</kbd> to save
        </span>
      </footer>
    </div>
  );
}
