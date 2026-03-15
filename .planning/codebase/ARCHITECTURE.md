# Architecture

**Analysis Date:** 2026-03-16

## Pattern Overview

**Overall:** Full-stack local-first web application with a Vite/React SPA, a single Express/Node backend, and shared WebSocket transport for chat and terminal streaming.

**Key Characteristics:**
- One Node server in `server/index.js` owns REST APIs, static hosting, WebSocket upgrades, provider orchestration, PTY shells, and file operations
- Frontend logic is feature-oriented under `src/components/` with hooks/contexts mediating server state
- Persistent state is mostly local: SQLite for app metadata plus provider-owned files under the user home directory
- Provider execution mixes SDK-based integrations (`server/claude-sdk.js`, `server/openai-codex.js`) with child-process CLI integrations (`server/cursor-cli.js`, `server/gemini-cli.js`)

## Layers

**Presentation Layer:**
- Purpose: Render the web UI and route user interactions
- Contains: `src/App.tsx`, `src/components/app/AppContent.tsx`, feature views under `src/components/**/view`
- Depends on: React contexts, hooks, and `src/utils/api.js`
- Used by: Browser clients

**Client State/Transport Layer:**
- Purpose: Coordinate auth, selected project/session state, push notifications, and real-time streams
- Contains: `src/components/auth/context/AuthContext.tsx`, `src/contexts/WebSocketContext.tsx`, `src/hooks/useProjectsState.ts`, `src/components/chat/hooks/*`
- Depends on: REST endpoints, WebSocket messages, browser storage, service worker
- Used by: Presentation components

**API/Transport Layer:**
- Purpose: Accept HTTP/WebSocket requests and route them to domain logic
- Contains: `server/index.js` plus route modules in `server/routes/*.js`
- Depends on: auth middleware, provider modules, filesystem/database utilities
- Used by: SPA frontend, plugin RPC clients, external `/api/agent` consumers

**Provider/Domain Layer:**
- Purpose: Run Claude/Codex/Cursor/Gemini sessions, project discovery, TaskMaster flows, plugins, and notifications
- Contains: `server/claude-sdk.js`, `server/openai-codex.js`, `server/projects.js`, `server/services/*.js`, `server/utils/*.js`
- Depends on: external CLIs/SDKs, local provider config directories, SQLite, OS filesystem
- Used by: route handlers and WebSocket message handlers

**Persistence Layer:**
- Purpose: Store app metadata and read provider-owned state from disk
- Contains: `server/database/db.js`, `server/database/init.sql`, home-directory config/session locations referenced in `server/projects.js` and route files
- Depends on: `better-sqlite3`, `sqlite/sqlite3`, filesystem
- Used by: auth, settings, session naming, project discovery, notifications

## Data Flow

**Initial App Load:**
1. Browser loads the SPA from `dist/` via `server/index.js`
2. `src/App.tsx` mounts providers for auth, WebSocket, plugins, tasks, and theme
3. `AuthProvider` in `src/components/auth/context/AuthContext.tsx` checks `/api/auth/status` and `/api/auth/user`
4. `useProjectsState` calls `/api/projects` through `src/utils/api.js`
5. `WebSocketProvider` opens `/ws` and begins receiving project/session updates
6. `AppContent` routes the selected project/session into chat, files, shell, git, task, or plugin tabs

**Chat Command Execution:**
1. `ChatComposer` in `src/components/chat/view/subcomponents/ChatComposer.tsx` submits a provider command
2. `src/contexts/WebSocketContext.tsx` sends a JSON message over `/ws`
3. `handleChatConnection` in `server/index.js` dispatches by `data.type`
4. Provider bridge executes the request (`queryClaudeSDK`, `queryCodex`, `spawnCursor`, `spawnGemini`)
5. Streaming provider events are normalized to WebSocket payloads
6. `useChatRealtimeHandlers` updates UI messages, loading state, permissions, and session navigation

**Shell Session Execution:**
1. `src/components/shell/hooks/useShellConnection.ts` opens `/shell`
2. `handleShellConnection` in `server/index.js` creates or resumes a PTY-backed session
3. `node-pty` streams terminal output to the browser
4. `Shell` and `useShellRuntime` in `src/components/shell/` keep terminal UI state synchronized

**Project/File Management:**
1. Frontend file tree, git, and workspace flows call REST endpoints from `src/utils/api.js`
2. `server/index.js` or `server/routes/*.js` validate auth and workspace/file paths
3. Server reads or mutates project files, Git metadata, and provider discovery data on disk
4. File watchers in `server/index.js` broadcast `projects_updated` messages to connected clients

**State Management:**
- Client state: React state + contexts + `localStorage`/`sessionStorage`
- Server state: SQLite, provider home-directory files, and in-memory maps for active sessions/plugins/watchers

## Key Abstractions

**Provider Bridge:**
- Purpose: Normalize multiple AI backends behind similar streaming/session semantics
- Examples: `server/claude-sdk.js`, `server/openai-codex.js`, `server/cursor-cli.js`, `server/gemini-cli.js`
- Pattern: Adapter layer with provider-specific execution + shared WebSocket payload style

**Feature Module:**
- Purpose: Keep frontend concerns grouped by product area
- Examples: `src/components/chat/`, `src/components/file-tree/`, `src/components/git-panel/`, `src/components/shell/`
- Pattern: Folder-per-feature with `view/`, `hooks/`, `types/`, `utils/`, and `constants/`

**Route Module:**
- Purpose: Group related server APIs by domain
- Examples: `server/routes/auth.js`, `server/routes/codex.js`, `server/routes/plugins.js`, `server/routes/taskmaster.js`
- Pattern: Express router module imported and mounted from `server/index.js`

**Context Provider:**
- Purpose: Share cross-cutting client state without prop drilling
- Examples: `AuthProvider`, `WebSocketProvider`, `PluginsProvider`, `TaskMasterProvider`
- Pattern: React context + custom hook accessor

## Entry Points

**Server Entry:**
- Location: `server/index.js`
- Triggers: `npm run server`, `npm run dev`, CLI bin startup
- Responsibilities: load env, initialize DB, configure web push, mount routes, start watchers, host HTTP/WebSocket services

**Frontend Entry:**
- Location: `src/main.jsx`
- Triggers: Vite dev/build output loading in the browser
- Responsibilities: mount `App`, global CSS, and React root

**CLI Entry:**
- Location: `server/cli.js`
- Triggers: `claude-code-ui` / `cloudcli` commands from `package.json`
- Responsibilities: start/manage the packaged application runtime

## Error Handling

**Strategy:** Boundary-level try/catch with JSON error responses for HTTP, explicit error events for WebSockets, and console logging throughout.

**Patterns:**
- Route handlers usually catch and respond directly in `server/routes/*.js`
- WebSocket message handling catches per-message failures and emits `{ type: 'error' }` in `server/index.js`
- Frontend uses `ErrorBoundary` in `src/components/main-content/view/ErrorBoundary.tsx` and targeted hook-level recovery (for example reconnect logic in `src/contexts/WebSocketContext.tsx`)

## Cross-Cutting Concerns

**Logging:**
- Console-based logging is used on both server and client, especially around provider sessions and filesystem operations

**Validation:**
- Auth and API-key middleware in `server/middleware/auth.js`
- Workspace/path validation in `server/routes/projects.js`
- Plugin manifest/path validation in `server/utils/plugin-loader.js`

**Authentication:**
- JWT-based auth for most `/api/**` routes
- WebSocket auth happens in `verifyClient` within `server/index.js`
- Platform mode bypasses token checks and injects the first database user

**Notifications:**
- Push subscription management in `server/routes/settings.js`
- Browser service worker integration in `public/sw.js`

---
*Architecture analysis: 2026-03-16*
*Update when major patterns change*
