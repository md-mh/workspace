"use client";

import { FormEvent, useMemo, useState } from "react";

import { cn } from "@/lib/cn";
import { NodeType } from "@/lib/types";
import { MAX_NAME_LENGTH, validateName, withTextExtension } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useWorkspace } from "@/components/workspace-provider";

interface NameDialogProps {
  mode: "create" | "rename";
  type: NodeType;
  parentId: string;
  /** Present when renaming, so an item is not a duplicate of itself. */
  nodeId?: string;
  initialName?: string;
  onSubmit: (name: string) => void;
  onClose: () => void;
}

export function NameDialog({
  mode,
  type,
  parentId,
  nodeId,
  initialName = "",
  onSubmit,
  onClose,
}: NameDialogProps) {
  const { state } = useWorkspace();
  const [value, setValue] = useState(initialName);
  const [touched, setTouched] = useState(false);

  const trimmed = value.trim();

  // Text files keep a .txt ending, so the duplicate check has to run against
  // the name that will actually be stored.
  const finalName = type === "file" && trimmed.length > 0 ? withTextExtension(trimmed) : trimmed;

  const error = useMemo(
    () =>
      validateName({
        name: finalName,
        type,
        parentId,
        nodes: state.nodes,
        ignoreId: nodeId,
      }),
    [finalName, type, parentId, state.nodes, nodeId],
  );

  const unchanged = mode === "rename" && finalName === initialName;
  const canSubmit = error === null && !unchanged;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (!canSubmit) return;
    onSubmit(finalName);
  };

  const noun = type === "folder" ? "folder" : "text file";
  const title =
    mode === "create" ? `New ${noun}` : `Rename ${type === "folder" ? "folder" : "file"}`;

  const parentName = state.nodes[parentId]?.name ?? "this folder";

  return (
    <Modal
      title={title}
      description={
        mode === "create" ? `The ${noun} will be created inside “${parentName}”.` : undefined
      }
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!canSubmit}>
            {mode === "create" ? "Create" : "Rename"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="node-name" className="mb-1.5 block text-sm font-medium text-slate-700">
          Name
        </label>
        <input
          id="node-name"
          value={value}
          autoComplete="off"
          spellCheck={false}
          maxLength={MAX_NAME_LENGTH + 20}
          placeholder={type === "folder" ? "Design assets" : "meeting-notes.txt"}
          aria-invalid={touched && error !== null}
          aria-describedby="node-name-hint"
          onChange={(event) => {
            setValue(event.target.value);
            setTouched(true);
          }}
          className={cn(
            "w-full rounded-lg border px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition",
            "placeholder:text-slate-400 focus:ring-2",
            touched && error
              ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
              : "border-slate-200 focus:border-indigo-400 focus:ring-indigo-100",
          )}
        />

        <p id="node-name-hint" className="mt-2 min-h-[1.25rem] text-xs">
          {touched && error ? (
            <span className="text-rose-600">{error}</span>
          ) : type === "file" && trimmed.length > 0 && finalName !== trimmed ? (
            <span className="text-slate-500">
              Will be saved as <span className="font-medium text-slate-700">{finalName}</span>
            </span>
          ) : (
            <span className="text-slate-400">
              {type === "folder"
                ? "Folders can hold other folders and text files."
                : "A .txt ending is added when you leave it out."}
            </span>
          )}
        </p>

        {/* Lets Enter submit the form without a visible duplicate button. */}
        <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />
      </form>
    </Modal>
  );
}
