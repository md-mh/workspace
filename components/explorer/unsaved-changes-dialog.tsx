"use client";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useWorkspace } from "@/components/workspace-provider";

/**
 * Shown when the user tries to leave a file with unsaved edits. Staying put is
 * the default action, so an accidental click never loses work.
 */
export function UnsavedChangesDialog() {
  const { isGuardOpen, openFile, saveAndContinue, discardAndContinue, cancelNavigation } =
    useWorkspace();

  if (!isGuardOpen) return null;

  return (
    <Modal
      title="You have unsaved changes"
      description={`“${openFile?.name ?? "This file"}” has edits that have not been saved yet.`}
      onClose={cancelNavigation}
      footer={
        <>
          <Button onClick={cancelNavigation} data-autofocus>
            Keep editing
          </Button>
          <Button onClick={discardAndContinue}>Discard</Button>
          <Button variant="primary" onClick={saveAndContinue}>
            Save and continue
          </Button>
        </>
      }
    >
      <p className="text-sm text-slate-600">
        Save them before moving on, or discard them and leave the file as it was.
      </p>
    </Modal>
  );
}
