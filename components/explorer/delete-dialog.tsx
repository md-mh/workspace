"use client";

import { useMemo } from "react";

import { summariseSubtree } from "@/lib/tree";
import { WorkspaceNode } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useWorkspace } from "@/components/workspace-provider";

interface DeleteDialogProps {
  node: WorkspaceNode;
  onConfirm: () => void;
  onClose: () => void;
}

export function DeleteDialog({ node, onConfirm, onClose }: DeleteDialogProps) {
  const { state, currentFolder } = useWorkspace();

  const summary = useMemo(
    () => (node.type === "folder" ? summariseSubtree(state.nodes, node.id) : null),
    [state.nodes, node],
  );

  const nestedTotal = summary ? summary.folders + summary.files : 0;
  const deletingCurrentFolder = node.type === "folder" && node.id === currentFolder.id;

  return (
    <Modal
      tone="danger"
      title={node.type === "folder" ? "Delete folder" : "Delete file"}
      description={`“${node.name}” will be removed from the workspace. This cannot be undone.`}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm} data-autofocus>
            Delete
          </Button>
        </>
      }
    >
      <div className="space-y-2 text-sm text-slate-600">
        {summary && nestedTotal > 0 ? (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-rose-700 ring-1 ring-inset ring-rose-100">
            Everything inside it goes too — {describeContents(summary.folders, summary.files)}.
          </p>
        ) : node.type === "folder" ? (
          <p className="rounded-lg bg-slate-50 px-3 py-2 text-slate-600 ring-1 ring-inset ring-slate-100">
            This folder is empty.
          </p>
        ) : null}

        {deletingCurrentFolder ? (
          <p className="text-slate-500">
            You are viewing this folder, so the explorer moves up to the closest folder that is
            still there.
          </p>
        ) : null}
      </div>
    </Modal>
  );
}

function describeContents(folders: number, files: number): string {
  const parts: string[] = [];
  if (folders > 0) parts.push(`${folders} ${folders === 1 ? "folder" : "folders"}`);
  if (files > 0) parts.push(`${files} ${files === 1 ? "file" : "files"}`);
  return parts.join(" and ");
}
