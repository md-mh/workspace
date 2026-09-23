"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";

import { createId } from "@/lib/id";
import { createEmptyWorkspace, createSeedWorkspace } from "@/lib/seed";
import { clearStoredState, loadState, saveState } from "@/lib/storage";
import { getBreadcrumb, getChildren } from "@/lib/tree";
import { Crumb, FileNode, FolderNode, WorkspaceNode, WorkspaceState } from "@/lib/types";
import { workspaceReducer } from "@/lib/workspace-reducer";

interface Draft {
  fileId: string;
  content: string;
}

interface WorkspaceContextValue {
  state: WorkspaceState;
  hydrated: boolean;
  currentFolder: FolderNode;
  currentChildren: WorkspaceNode[];
  breadcrumb: Crumb[];
  openFile: FileNode | null;

  openFolder: (folderId: string) => void;
  openFileById: (fileId: string) => void;
  closeFile: () => void;
  toggleFolder: (folderId: string) => void;
  reveal: (nodeId: string) => void;

  createNode: (type: "folder" | "file", name: string, parentId: string) => string;
  renameNode: (id: string, name: string) => void;
  deleteNode: (id: string) => void;
  resetWorkspace: (mode: "sample" | "empty") => void;

  draftContent: string | null;
  isDirty: boolean;
  updateDraft: (content: string) => void;
  saveDraft: () => void;
  revertDraft: () => void;

  /** True while a navigation is waiting on the unsaved-changes prompt. */
  isGuardOpen: boolean;
  saveAndContinue: () => void;
  discardAndContinue: () => void;
  cancelNavigation: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(workspaceReducer, undefined, createEmptyWorkspace);
  const [hydrated, setHydrated] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [pendingNavigation, setPendingNavigation] = useState<{ run: () => void } | null>(null);

  // Persisted state is read after mount: the server render has no localStorage,
  // so doing it here keeps the first client render identical to the markup.
  useEffect(() => {
    dispatch({ type: "hydrate", state: loadState() ?? createSeedWorkspace() });
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveState(state);
  }, [state, hydrated]);

  const openFileNode = state.openFileId ? state.nodes[state.openFileId] : undefined;
  const openFile = openFileNode && openFileNode.type === "file" ? openFileNode : null;

  const draftContent = draft && openFile && draft.fileId === openFile.id ? draft.content : null;
  const isDirty = openFile !== null && draftContent !== null && draftContent !== openFile.content;

  // Navigation handlers read the flag inside callbacks, so it is mirrored in a
  // ref to avoid rebuilding every handler on each keystroke.
  const isDirtyRef = useRef(isDirty);
  useEffect(() => {
    isDirtyRef.current = isDirty;
  }, [isDirty]);

  // Covers refreshes and tab closes, which the in-app prompt cannot intercept.
  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const guard = useCallback((run: () => void) => {
    if (isDirtyRef.current) {
      setPendingNavigation({ run });
      return;
    }
    run();
  }, []);

  const openFolder = useCallback(
    (folderId: string) => {
      guard(() => {
        setDraft(null);
        dispatch({ type: "open-folder", folderId });
      });
    },
    [guard],
  );

  const openFileById = useCallback(
    (fileId: string) => {
      if (fileId === state.openFileId) return;
      guard(() => {
        setDraft(null);
        dispatch({ type: "open-file", fileId });
      });
    },
    [guard, state.openFileId],
  );

  const closeFile = useCallback(() => {
    guard(() => {
      setDraft(null);
      dispatch({ type: "close-file" });
    });
  }, [guard]);

  const toggleFolder = useCallback((folderId: string) => {
    dispatch({ type: "toggle-folder", folderId });
  }, []);

  const reveal = useCallback(
    (nodeId: string) => {
      guard(() => {
        setDraft(null);
        dispatch({ type: "reveal", nodeId });
      });
    },
    [guard],
  );

  const createNode = useCallback((type: "folder" | "file", name: string, parentId: string) => {
    const now = Date.now();
    const id = createId(type);

    const node: WorkspaceNode =
      type === "folder"
        ? { id, name: name.trim(), type, parentId, createdAt: now, updatedAt: now }
        : { id, name: name.trim(), type, parentId, content: "", createdAt: now, updatedAt: now };

    dispatch({ type: "create-node", node });
    return id;
  }, []);

  const renameNode = useCallback((id: string, name: string) => {
    dispatch({ type: "rename-node", id, name, timestamp: Date.now() });
  }, []);

  const deleteNode = useCallback((id: string) => {
    setDraft((current) => (current && current.fileId === id ? null : current));
    dispatch({ type: "delete-node", id });
  }, []);

  const resetWorkspace = useCallback((mode: "sample" | "empty") => {
    clearStoredState();
    setDraft(null);
    setPendingNavigation(null);
    dispatch({
      type: "replace",
      state: mode === "sample" ? createSeedWorkspace() : createEmptyWorkspace(),
    });
  }, []);

  const updateDraft = useCallback(
    (content: string) => {
      if (!state.openFileId) return;
      setDraft({ fileId: state.openFileId, content });
    },
    [state.openFileId],
  );

  const saveDraft = useCallback(() => {
    if (!draft) return;
    dispatch({
      type: "save-file",
      id: draft.fileId,
      content: draft.content,
      timestamp: Date.now(),
    });
    setDraft(null);
  }, [draft]);

  const revertDraft = useCallback(() => {
    setDraft(null);
  }, []);

  const saveAndContinue = useCallback(() => {
    if (draft) {
      dispatch({
        type: "save-file",
        id: draft.fileId,
        content: draft.content,
        timestamp: Date.now(),
      });
    }
    setDraft(null);
    isDirtyRef.current = false;
    pendingNavigation?.run();
    setPendingNavigation(null);
  }, [draft, pendingNavigation]);

  const discardAndContinue = useCallback(() => {
    setDraft(null);
    isDirtyRef.current = false;
    pendingNavigation?.run();
    setPendingNavigation(null);
  }, [pendingNavigation]);

  const cancelNavigation = useCallback(() => {
    setPendingNavigation(null);
  }, []);

  // The reducer keeps currentFolderId valid, the fallback is belt and braces.
  const currentFolder = (state.nodes[state.currentFolderId] ??
    state.nodes[state.rootId]) as FolderNode;

  const currentChildren = useMemo(
    () => getChildren(state.nodes, currentFolder.id),
    [state.nodes, currentFolder.id],
  );

  const breadcrumb = useMemo(
    () => getBreadcrumb(state.nodes, currentFolder.id),
    [state.nodes, currentFolder.id],
  );

  const value: WorkspaceContextValue = {
    state,
    hydrated,
    currentFolder,
    currentChildren,
    breadcrumb,
    openFile,
    openFolder,
    openFileById,
    closeFile,
    toggleFolder,
    reveal,
    createNode,
    renameNode,
    deleteNode,
    resetWorkspace,
    draftContent,
    isDirty,
    updateDraft,
    saveDraft,
    revertDraft,
    isGuardOpen: pendingNavigation !== null,
    saveAndContinue,
    discardAndContinue,
    cancelNavigation,
  };

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace(): WorkspaceContextValue {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used inside a WorkspaceProvider");
  }
  return context;
}
