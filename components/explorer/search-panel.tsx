"use client";

import { useMemo } from "react";

import { searchWorkspace, splitOnMatch } from "@/lib/search";
import { Button } from "@/components/ui/button";
import { FileIcon, FolderIcon, SearchIcon } from "@/components/ui/icons";
import { useWorkspace } from "@/components/workspace-provider";

interface SearchPanelProps {
  query: string;
  onClear: () => void;
}

export function SearchPanel({ query, onClear }: SearchPanelProps) {
  const { state, reveal } = useWorkspace();

  const results = useMemo(
    () => searchWorkspace(state.nodes, query, state.rootId),
    [state.nodes, query, state.rootId],
  );

  return (
    <div className="flex h-full flex-col">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-6">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold text-slate-900">
            Results for “{query.trim()}”
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {results.length === 0
              ? "Nothing matched"
              : `${results.length} ${results.length === 1 ? "match" : "matches"} across the workspace`}
          </p>
        </div>
        <Button onClick={onClear}>Clear search</Button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2 sm:px-4 sm:py-3">
        {results.length > 0 ? (
          <ul className="space-y-0.5">
            {results.map((result) => (
              <li key={result.node.id}>
                <button
                  type="button"
                  onClick={() => {
                    reveal(result.node.id);
                    onClear();
                  }}
                  className="flex w-full items-start gap-3 rounded-xl px-2 py-2.5 text-left transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-indigo-400"
                >
                  <span
                    className={
                      result.node.type === "folder"
                        ? "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600"
                        : "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500"
                    }
                  >
                    {result.node.type === "folder" ? (
                      <FolderIcon className="h-5 w-5" />
                    ) : (
                      <FileIcon className="h-5 w-5" />
                    )}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-slate-800">
                        {result.matchedIn === "name" ? (
                          <Highlighted text={result.node.name} query={query} />
                        ) : (
                          result.node.name
                        )}
                      </span>
                      {result.matchedIn === "content" ? (
                        <span className="shrink-0 rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-700">
                          in text
                        </span>
                      ) : null}
                    </span>

                    <span className="mt-0.5 block truncate text-xs text-slate-400">
                      {result.parentPath}
                    </span>

                    {result.snippet ? (
                      <span className="mt-1 block truncate font-mono text-xs text-slate-500">
                        <Highlighted text={result.snippet} query={query} />
                      </span>
                    ) : null}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex h-full min-h-[16rem] flex-col items-center justify-center px-6 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <SearchIcon className="h-6 w-6" />
            </span>
            <p className="mt-3 text-sm font-medium text-slate-700">No matches found</p>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              Nothing in the workspace is named “{query.trim()}”, and no file contains it either.
            </p>
            <Button className="mt-4" onClick={onClear}>
              Back to the folder
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function Highlighted({ text, query }: { text: string; query: string }) {
  const parts = splitOnMatch(text, query);

  return (
    <>
      {parts.map((part, index) =>
        part.match ? (
          <mark key={index} className="rounded bg-amber-100 px-0.5 text-inherit">
            {part.text}
          </mark>
        ) : (
          <span key={index}>{part.text}</span>
        ),
      )}
    </>
  );
}
