# Mini Workspace Explorer

A file manager that runs entirely in the browser. Create folders and text files, nest them as deep
as you like, then rename, delete, search and edit them. Everything is kept in `localStorage`, so a
refresh loses nothing.

Built for the Webbly Media frontend assessment.

**Live Link:** [https://workspace01-mh.vercel.app/](https://workspace01-mh.vercel.app/)

---

## Running it

You need Node 18.17 or newer.

```bash
git clone https://github.com/md-mh/workspace.git
npm install
npm run dev
```

The app opens at [http://localhost:3005](http://localhost:3005).

| Script          | What it does                 |
| --------------- | ---------------------------- |
| `npm run dev`   | Dev server with fast refresh |
| `npm run build` | Production build             |
| `npm start`     | Serve the production build   |

There is no backend, no API route and no environment variable, so importing the repository into
Vercel works on the default settings.

---

## What it does

- Folder tree in the sidebar, folder contents in the main panel, clickable breadcrumb above it
- Create, rename and delete folders and files, each behind a dialog that validates as you type
- Text editor with an unsaved-changes indicator, save, revert and a line/word/character count
- Search across names and the text inside files, showing the full path of every hit
- Saves to `localStorage` after every change
- The sidebar becomes a slide-over drawer below the `lg` breakpoint

**Shortcuts:** `Ctrl`/`Cmd` + `K` or `/` focuses search, `Esc` clears it or closes a dialog,
`Ctrl`/`Cmd` + `S` saves, `F2` renames the focused row, `Delete` deletes it.

---

## Where things live

```
app/          layout, page, global styles
components/   workspace-provider.tsx (state) + explorer/ (the UI) + ui/ (button, modal, toast, icons)
lib/          types, reducer, tree helpers, search, validation, storage, seed, format
```

---

## How the data is shaped

The tree is stored **flat** — a map of id to node — and the hierarchy is only `parentId`:

```ts
type NodeMap = Record<string, WorkspaceNode>;
```

A nested `children: Node[]` shape was the obvious alternative. The flat map won for three reasons:

1. Updates are direct. Renaming a file is `{ ...nodes, [id]: next }`, not a recursive copy of
   everything down the path.
2. It serialises as-is, so the persistence layer stays small.
3. Search never recurses. A file ten folders deep costs the same to find as one in the root.

The recursion a tree genuinely needs still lives in `lib/tree.ts` — walking up for a breadcrumb,
walking down for a cascading delete. Nesting is unbounded, and the root is the only node that
cannot be renamed or deleted, so the workspace always has somewhere to stand.

---

## State management

`useReducer` plus context. No state library — the logic is small enough to keep in one readable
place.

```
WorkspaceProvider
  ├── useReducer        every tree transition
  ├── draft state       the unsaved text of the open file
  ├── navigation guard  blocks navigation while a draft is dirty
  └── persistence       writes to localStorage on change
```

Three choices worth calling out:

- **The reducer is pure.** Ids and timestamps are generated in the provider, never inside the
  reducer, so the same action always gives the same state.
- **Selection lives in reducer state,** not separate `useState` calls. Deleting a node has to fix
  `currentFolderId` and `openFileId` in the same transition, or a delete and a redirect drift apart.
- **Unsaved text sits outside the reducer,** so typing does not touch the persisted tree or write to
  `localStorage` on every keystroke. A file enters the node map when it is saved.

Dialogs get their own small context, so the tree, the folder list and the editor can all trigger the
same rename or delete without threading callbacks through four layers of props.

---

## Decisions

I chose a simple and predictable file-management experience: folders stay in the sidebar, while files open in the main panel for editing. Names are validated as users type, and deleting folders safely removes their contents while keeping navigation intact.

---
