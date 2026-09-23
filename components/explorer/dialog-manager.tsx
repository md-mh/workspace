"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

import { NodeType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { useWorkspace } from "@/components/workspace-provider";
import { DeleteDialog } from "./delete-dialog";
import { NameDialog } from "./name-dialog";

type DialogState =
  | { kind: "create"; type: NodeType; parentId: string }
  | { kind: "rename"; nodeId: string }
  | { kind: "delete"; nodeId: string }
  | { kind: "reset" }
  | null;

interface DialogContextValue {
  requestCreate: (type: NodeType, parentId: string) => void;
  requestRename: (nodeId: string) => void;
  requestDelete: (nodeId: string) => void;
  requestReset: () => void;
}

const DialogContext = createContext<DialogContextValue | null>(null);

/**
 * Keeps every confirmation flow in one place so the tree, the folder list and
 * the editor can all ask for the same dialogs without passing props around.
 */
export function DialogManager({ children }: { children: React.ReactNode }) {
  const { state, createNode, renameNode, deleteNode, openFileById, resetWorkspace } =
    useWorkspace();
  const { notify } = useToast();
  const [dialog, setDialog] = useState<DialogState>(null);

  const close = useCallback(() => setDialog(null), []);

  const actions = useMemo<DialogContextValue>(
    () => ({
      requestCreate: (type, parentId) => setDialog({ kind: "create", type, parentId }),
      requestRename: (nodeId) => setDialog({ kind: "rename", nodeId }),
      requestDelete: (nodeId) => setDialog({ kind: "delete", nodeId }),
      requestReset: () => setDialog({ kind: "reset" }),
    }),
    [],
  );

  const renameTarget = dialog?.kind === "rename" ? state.nodes[dialog.nodeId] : undefined;
  const deleteTarget = dialog?.kind === "delete" ? state.nodes[dialog.nodeId] : undefined;

  return (
    <DialogContext.Provider value={actions}>
      {children}

      {dialog?.kind === "create" ? (
        <NameDialog
          mode="create"
          type={dialog.type}
          parentId={dialog.parentId}
          onClose={close}
          onSubmit={(name) => {
            const id = createNode(dialog.type, name, dialog.parentId);
            close();
            // A brand new text file opens straight away — there is nothing to look at otherwise.
            if (dialog.type === "file") openFileById(id);
            notify(`${dialog.type === "folder" ? "Folder" : "File"} “${name}” created`);
          }}
        />
      ) : null}

      {dialog?.kind === "rename" && renameTarget ? (
        <NameDialog
          mode="rename"
          type={renameTarget.type}
          parentId={renameTarget.parentId ?? state.rootId}
          nodeId={renameTarget.id}
          initialName={renameTarget.name}
          onClose={close}
          onSubmit={(name) => {
            renameNode(renameTarget.id, name);
            close();
            notify(`Renamed to “${name}”`);
          }}
        />
      ) : null}

      {dialog?.kind === "delete" && deleteTarget ? (
        <DeleteDialog
          node={deleteTarget}
          onClose={close}
          onConfirm={() => {
            deleteNode(deleteTarget.id);
            close();
            notify(`Deleted “${deleteTarget.name}”`);
          }}
        />
      ) : null}

      {dialog?.kind === "reset" ? (
        <Modal
          title="Reset workspace"
          description="Everything currently stored in this browser is replaced."
          onClose={close}
          footer={
            <>
              <Button onClick={close} data-autofocus>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  resetWorkspace("empty");
                  close();
                  notify("Workspace cleared");
                }}
              >
                Start empty
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  resetWorkspace("sample");
                  close();
                  notify("Sample workspace restored");
                }}
              >
                Restore sample
              </Button>
            </>
          }
        >
          <p className="text-sm text-slate-600">
            Start from an empty workspace with just the root folder, or bring back the sample tree
            the app ships with.
          </p>
        </Modal>
      ) : null}
    </DialogContext.Provider>
  );
}

export function useDialogs(): DialogContextValue {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useDialogs must be used inside a DialogManager");
  }
  return context;
}
