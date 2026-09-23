import { NodeMap, WorkspaceState } from "./types";

export const ROOT_ID = "root";
export const ROOT_NAME = "Workspace";

const NOTES_CONTENT = [
  "Webbly — assessment notes",
  "",
  "- Tree lives in a flat map, parentId keeps the hierarchy",
  "- Sidebar shows folders, the main panel shows what is inside one",
  "- Everything is written back to localStorage after each change",
  "",
  "Press Ctrl + S (Cmd + S on Mac) to save a file without reaching for the mouse.",
].join("\n");

const TASKS_CONTENT = [
  "[x] Sketch the folder tree",
  "[x] Wire up create / rename / delete",
  "[ ] Re-read the edge cases list before submitting",
].join("\n");

const README_CONTENT = [
  "Welcome to Mini Workspace Explorer.",
  "",
  "Use the sidebar to move between folders and the toolbar to add a folder or a",
  "text file inside the folder you are currently in. Click any text file to open",
  "it in the editor — changes are kept once you save them, even after a refresh.",
  "",
  "Search looks through every folder, however deeply nested, and also peeks inside",
  "the text of your files.",
].join("\n");

/**
 * The starter tree from the brief. New visitors land on something they can click
 * around in; the workspace can still be emptied from the toolbar.
 */
export function createSeedWorkspace(): WorkspaceState {
  const now = Date.now();
  const stamp = (offsetMinutes: number) => now - offsetMinutes * 60_000;

  const nodes: NodeMap = {
    [ROOT_ID]: {
      id: ROOT_ID,
      name: ROOT_NAME,
      type: "folder",
      parentId: null,
      createdAt: stamp(90),
      updatedAt: stamp(90),
    },
    projects: {
      id: "projects",
      name: "Projects",
      type: "folder",
      parentId: ROOT_ID,
      createdAt: stamp(75),
      updatedAt: stamp(75),
    },
    webbly: {
      id: "webbly",
      name: "Webbly",
      type: "folder",
      parentId: "projects",
      createdAt: stamp(60),
      updatedAt: stamp(60),
    },
    personal: {
      id: "personal",
      name: "Personal",
      type: "folder",
      parentId: "projects",
      createdAt: stamp(58),
      updatedAt: stamp(58),
    },
    documents: {
      id: "documents",
      name: "Documents",
      type: "folder",
      parentId: ROOT_ID,
      createdAt: stamp(50),
      updatedAt: stamp(50),
    },
    notes: {
      id: "notes",
      name: "notes.txt",
      type: "file",
      parentId: "webbly",
      content: NOTES_CONTENT,
      createdAt: stamp(40),
      updatedAt: stamp(12),
    },
    tasks: {
      id: "tasks",
      name: "tasks.txt",
      type: "file",
      parentId: "webbly",
      content: TASKS_CONTENT,
      createdAt: stamp(35),
      updatedAt: stamp(8),
    },
    readme: {
      id: "readme",
      name: "README.txt",
      type: "file",
      parentId: ROOT_ID,
      content: README_CONTENT,
      createdAt: stamp(30),
      updatedAt: stamp(30),
    },
  };

  return {
    nodes,
    rootId: ROOT_ID,
    currentFolderId: ROOT_ID,
    openFileId: null,
    expandedIds: { [ROOT_ID]: true, projects: true },
  };
}

/** An empty workspace keeps only the root folder. */
export function createEmptyWorkspace(): WorkspaceState {
  const now = Date.now();

  return {
    nodes: {
      [ROOT_ID]: {
        id: ROOT_ID,
        name: ROOT_NAME,
        type: "folder",
        parentId: null,
        createdAt: now,
        updatedAt: now,
      },
    },
    rootId: ROOT_ID,
    currentFolderId: ROOT_ID,
    openFileId: null,
    expandedIds: { [ROOT_ID]: true },
  };
}
