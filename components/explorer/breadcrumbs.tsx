"use client";

import { Fragment, useEffect, useState } from "react";

import { cn } from "@/lib/cn";
import { Crumb } from "@/lib/types";
import { ChevronRightIcon } from "@/components/ui/icons";

interface BreadcrumbsProps {
  crumbs: Crumb[];
  onNavigate: (folderId: string) => void;
  /** Rendered after the folder path, e.g. the open file name. */
  trailing?: React.ReactNode;
}

const COLLAPSE_AFTER = 4;

export function Breadcrumbs({ crumbs, onNavigate, trailing }: BreadcrumbsProps) {
  const [expanded, setExpanded] = useState(false);

  // A deep path stays collapsed again once the user moves somewhere else.
  useEffect(() => {
    setExpanded(false);
  }, [crumbs.length]);

  const collapsed = !expanded && crumbs.length > COLLAPSE_AFTER;
  const visible = collapsed ? [crumbs[0], ...crumbs.slice(-2)] : crumbs;

  return (
    <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1 text-sm">
      <ol className="flex min-w-0 items-center gap-1">
        {visible.map((crumb, index) => {
          const isLast = index === visible.length - 1 && !trailing;
          const showEllipsisBefore = collapsed && index === 1;

          return (
            <Fragment key={crumb.id}>
              {index > 0 ? (
                <ChevronRightIcon className="h-3.5 w-3.5 shrink-0 text-slate-300" />
              ) : null}

              {showEllipsisBefore ? (
                <>
                  <button
                    type="button"
                    onClick={() => setExpanded(true)}
                    title="Show full path"
                    className="rounded px-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    …
                  </button>
                  <ChevronRightIcon className="h-3.5 w-3.5 shrink-0 text-slate-300" />
                </>
              ) : null}

              <li className="min-w-0">
                <button
                  type="button"
                  onClick={() => onNavigate(crumb.id)}
                  aria-current={isLast ? "page" : undefined}
                  className={cn(
                    "max-w-[10rem] truncate rounded px-1.5 py-0.5 transition sm:max-w-[14rem]",
                    isLast
                      ? "font-medium text-slate-900"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-800",
                  )}
                >
                  {crumb.name}
                </button>
              </li>
            </Fragment>
          );
        })}
      </ol>

      {trailing ? (
        <>
          <ChevronRightIcon className="h-3.5 w-3.5 shrink-0 text-slate-300" />
          <span className="min-w-0 truncate font-medium text-slate-900">{trailing}</span>
        </>
      ) : null}
    </nav>
  );
}
