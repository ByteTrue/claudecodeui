# Architecture

**Analysis Date:** 2026-03-16

## Pattern Overview

**Overall:** Full-stack monolith with a React SPA frontend and an Express/WebSocket backend for AI-session orchestration

**Key Characteristics:**
- Single npm package ships both the browser UI and the Node server
- Browser interactions are split between REST calls and long-lived WebSocket channels
- Local filesystem and provider home directories are part of the runtime data model
- AI providers are wrapped behind server-side adapter modules instead of being called directly from the client

## Layers

**Client bootstrap layer:**
- Purpose: mount the SPA, register shared services, and compose providers
- Contains: `src/main.jsx`, `src/App.tsx`, `src/i18n/config.js`
- Depends on: React, routing, context providers
- Used by: browser entry

**Client state and transport layer:**
- Purpose: own auth state, WebSocket connectivity, project/session selection, and API calls
- Contains: `src/components/auth/context/AuthContext.tsx`, `src/contexts/WebSocketContext.tsx`, `src/hooks/useProjectsState.ts`, `src/utils/api.js`
- Depends on: REST endpoints and `/ws`
- Used by: feature components under `src/components/**`

**Feature UI layer:**
- Purpose: render the product surfaces for chat, files, shell, git, settings, onboarding, plugins, and tasks
- Contains: `src/components/chat/**`, `src/components/file-tree/**`, `src/components/shell/**`, `src/components/git-panel/**`, `src/components/settings/**`, `src/components/task-master/**`
- Depends on: shared UI primitives, hooks, contexts, and API utilities
- Used by: `src/components/app/AppContent.tsx` and `src/components/main-content/view/MainContent.tsx`

**HTTP and WebSocket orchestration layer:**
- Purpose: expose APIs, serve assets, authenticate clients, and route WebSocket traffic
- Contains: `server/index.js`, `server/routes/*.js`, `server/middleware/auth.js`
- Depends on: provider adapters, project discovery, database access, plugin utilities, filesystem helpers
- Used by: browser SPA, external agent API clients, plugin servers

**Provider integration layer:**
- Purpose: normalize Claude, Codex, Cursor, and Gemini execution into a common server-side session model
- Contains: `server/claude-sdk.js`, `server/openai-codex.js`, `server/cursor-cli.js`, `server/gemini-cli.js`
- Depends on: SDKs or local CLIs, notification services, WebSocket writer objects
- Used by: chat WebSocket handlers in `server/index.js` and provider-specific REST routes

**Persistence and discovery layer:**
- Purpose: persist auth/config state and discover projects/sessions from provider-owned storage
- Contains: `server/database/db.js`, `server/projects.js`, `server/sessionManager.js`
- Depends on: SQLite, provider directory layout, filesystem access
- Used by: auth middleware, project routes, watchers, notifications

## Data Flow

**Client startup flow:**
1. `src/main.jsx` mounts the app, loads i18n resources, and registers the service worker
2. `src/App.tsx` composes theme, auth, websocket, plugin, task, and task-settings providers
3. `src/components/auth/context/AuthContext.tsx` checks auth/setup state
4. `src/contexts/WebSocketContext.tsx` opens `/ws` once a token is available
5. `src/hooks/useProjectsState.ts` loads `/api/projects` and reacts to `projects_updated` socket messages
6. `src/components/app/AppContent.tsx` passes current project/session state into the main UI surfaces

**Provider run flow:**
1. A UI surface emits a WebSocket command such as `claude-command`, `codex-command`, `cursor-command`, or `gemini-command`
2. `server/index.js` routes the message from `/ws`
3. The corresponding adapter (`server/claude-sdk.js`, `server/openai-codex.js`, `server/cursor-cli.js`, or `server/gemini-cli.js`) starts or resumes a session
4. Adapter events are normalized and streamed back through a WebSocket writer
5. Frontend chat/session components update local state and render the result

**Project discovery flow:**
1. `server/index.js` watches provider directories with chokidar
2. A filesystem event clears the project-directory cache in `server/projects.js`
3. `getProjects()` rescans provider stores and merges Claude/Cursor/Codex/Gemini session metadata
4. The server broadcasts `projects_updated` to connected clients
5. `src/hooks/useProjectsState.ts` decides whether the update is additive or requires replacing local state

**State Management:**
- Client state is mostly React local state plus context providers
- Server session/process state is held in in-memory Maps
- Durable state lives in SQLite (`server/database/db.js`) and provider-owned filesystem data (`server/projects.js`)

## Key Abstractions

**Provider adapter:**
- Purpose: wrap one AI system behind a shared session lifecycle
- Examples: `queryClaudeSDK`, `queryCodex`, `spawnCursor`, `spawnGemini`
- Pattern: adapter module with active-session tracking and WebSocket event transformation

**WebSocket writer:**
- Purpose: hide transport differences from provider adapters
- Example: `WebSocketWriter` in `server/index.js`
- Pattern: small adapter object with `send()` and session metadata helpers

**Feature module:**
- Purpose: keep UI code grouped by user-facing area
- Examples: `src/components/chat/**`, `src/components/file-tree/**`, `src/components/git-panel/**`
- Pattern: feature folders with `view/`, `hooks/`, `types/`, `utils/`, and `constants/`

**Project/session discovery service:**
- Purpose: turn provider-native stores into the app's project/session model
- Examples: `getProjects`, `getSessions`, `getSessionMessages` in `server/projects.js`
- Pattern: filesystem/service module with caching and provider-specific parsing

## Entry Points

**Client entry:**
- Location: `src/main.jsx`
- Triggers: browser loads the SPA
- Responsibilities: render React, load CSS/i18n, register service worker

**App composition:**
- Location: `src/App.tsx`
- Triggers: initial render after client bootstrap
- Responsibilities: compose providers, protect routes, mount `AppContent`

**Server entry:**
- Location: `server/index.js`
- Triggers: `npm run server`, `npm run dev`, or the published CLI from `server/cli.js`
- Responsibilities: initialize DB, register routes, create WebSocket server, serve static assets, watch provider directories

**CLI entry:**
- Location: `server/cli.js`
- Triggers: `cloudcli` / `claude-code-ui` binary
- Responsibilities: parse CLI flags and start the Express server

## Error Handling

**Strategy:** catch errors at API or adapter boundaries, log them, and return JSON or socket error payloads

**Patterns:**
- Express handlers typically wrap logic in `try/catch` and respond with structured error JSON
- Provider adapters push failure events back to the client and clean up active-session Maps
- Client hooks and contexts often log and fail open instead of crashing the shell UI
- Auth middleware returns `401` or `403` rather than throwing upstream

## Cross-Cutting Concerns

**Authentication:**
- OSS mode uses JWTs from `server/middleware/auth.js`
- Platform mode bypasses normal token validation via `VITE_IS_PLATFORM`

**Internationalization:**
- All translation resources are preloaded in `src/i18n/config.js`

**Notifications:**
- Web push preferences, VAPID keys, and delivery live in `server/services/notification-orchestrator.js` and `server/services/vapid-keys.js`

**Plugins:**
- Plugin discovery, lifecycle, and RPC proxying are handled by `server/utils/plugin-loader.js`, `server/utils/plugin-process-manager.js`, and `server/routes/plugins.js`

**Filesystem safety:**
- Workspace and path validation live in `server/routes/projects.js`, `server/routes/git.js`, and related route helpers

---
*Architecture analysis: 2026-03-16*
*Update when major patterns change*
