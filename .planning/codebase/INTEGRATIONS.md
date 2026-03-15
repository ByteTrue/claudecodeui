# External Integrations

**Analysis Date:** 2026-03-16

## APIs & External Services

**AI Providers:**
- Anthropic Claude - Primary Claude chat/session execution
  - SDK/Client: `@anthropic-ai/claude-agent-sdk`
  - Integration method: Direct SDK streaming in `server/claude-sdk.js`
  - Auth: Claude CLI/SDK environment on the host; code also references `ANTHROPIC_API_KEY`
- OpenAI Codex - Codex chat threads and MCP management
  - SDK/Client: `@openai/codex-sdk`
  - Integration method: SDK thread lifecycle in `server/openai-codex.js`
  - Auth: Host Codex environment and `OPENAI_API_KEY`
- Cursor CLI - Session discovery and command execution
  - Integration method: Child-process execution plus SQLite/session file reads in `server/cursor-cli.js`, `server/routes/cursor.js`, and `server/projects.js`
  - Auth: Reads local Cursor config from `~/.cursor/cli-config.json` and `~/.cursor/mcp.json`
- Gemini CLI - Session execution and discovery
  - Integration method: Child-process execution and local session persistence in `server/gemini-cli.js` and `server/sessionManager.js`
  - Auth: Host Gemini environment and `GEMINI_API_KEY`

**GitHub:**
- GitHub REST API - Branch and pull request creation for agent workflows
  - SDK/Client: `@octokit/rest`
  - Integration method: REST API plus local `git` commands in `server/routes/agent.js`
  - Auth: Stored GitHub token or request-supplied token
- GitHub Releases API - Client-side version checks
  - Integration method: `fetch('https://api.github.com/repos/.../releases/latest')` in `src/hooks/useVersionCheck.ts`
  - Auth: None

**Plugin and Ecosystem Services:**
- TaskMaster CLI - Project/task workflow automation
  - Integration method: `npx task-master` / `task-master-ai` child-process execution in `server/routes/taskmaster.js`
  - Auth: Depends on host CLI/environment
- Discord webhook - Release notification only
  - Integration point: `.github/workflows/discord-release.yml`
  - Auth: `DISCORD_WEBHOOK_URL` GitHub Actions secret

## Data Storage

**Databases:**
- SQLite (`better-sqlite3`) - Primary app metadata store
  - Connection: Local file from `DATABASE_PATH` or default `server/database/auth.db`
  - Client: `better-sqlite3`
  - Tables include users, API keys, credentials, VAPID keys, push subscriptions, app config, and session names in `server/database/db.js`
- SQLite (`sqlite` + `sqlite3`) - Read access to Cursor session data
  - Source: Cursor-managed databases under `~/.cursor/chats/...`
  - Usage: Session discovery and message loading in `server/projects.js` and `server/routes/cursor.js`

**File Storage:**
- Local filesystem - Core storage strategy
  - Project files are read/written through endpoints in `server/index.js`
  - Provider state is read from host home directories such as `~/.claude`, `~/.cursor`, `~/.codex`, and `~/.gemini`
  - Plugin packages live in `~/.claude-code-ui/plugins` via `server/utils/plugin-loader.js`

**Caching:**
- Browser Cache API - Service-worker asset caching in `public/sw.js`
- In-memory server caches/maps - Project directory cache in `server/projects.js`, active session maps in provider bridges, running plugin registry in `server/utils/plugin-process-manager.js`

## Authentication & Identity

**Auth Provider:**
- Custom single-user auth
  - Implementation: bcrypt password hashes + JWTs in `server/routes/auth.js` and `server/middleware/auth.js`
  - Token storage: `localStorage` on OSS installs via `src/components/auth/context/AuthContext.tsx`
  - Session management: JWT with optional refreshed token header `X-Refreshed-Token`

**External API Access Control:**
- Optional API key gate
  - Implementation: `validateApiKey` middleware in `server/middleware/auth.js`
  - Usage: Applied to `/api/**` in `server/index.js`
- Agent API credentials
  - Implementation: stored API keys and GitHub tokens referenced by `server/routes/agent.js`

## Monitoring & Observability

**Error Tracking:**
- None dedicated
  - Logging is primarily `console.log`, `console.warn`, and `console.error` across `server/` and client hooks

**Analytics:**
- None found in the repository

**Logs:**
- Stdout/stderr only
  - Server logs provider commands, WebSocket activity, and some debug file-upload data in `server/index.js`
  - Plugin subprocess stderr is surfaced in `server/utils/plugin-process-manager.js`

## CI/CD & Deployment

**Hosting:**
- Self-hosted Node process serving API + static frontend from one runtime in `server/index.js`
- npm distribution target declared in `package.json` with CLI bins `claude-code-ui` and `cloudcli`

**CI Pipeline:**
- GitHub Actions
  - Workflow present: `.github/workflows/discord-release.yml`
  - Purpose: release notifications to Discord
  - No automated test/build workflow was found in `.github/workflows/`

## Environment Configuration

**Development:**
- Key env vars documented in `.env.example`
- Secrets/config live in environment variables and host-managed config files under `~/.claude`, `~/.cursor`, `~/.codex`, `~/.gemini`, and `~/.claude-code-ui`
- Dev proxy routes `/api`, `/ws`, and `/shell` through Vite in `vite.config.js`

**Production:**
- Secrets management is host-level environment management; no cloud secret manager integration is present in-repo
- Platform mode toggles with `VITE_IS_PLATFORM` and changes auth/WebSocket behavior in `server/constants/config.js` and `src/constants/config.ts`

## Webhooks & Callbacks

**Incoming:**
- Browser push callbacks via service worker in `public/sw.js`
  - Handles `push` and `notificationclick` events
  - Navigation payloads are relayed back into the app window

**Outgoing:**
- Web Push notifications
  - Triggered through `web-push` in `server/services/notification-orchestrator.js`
  - VAPID key management lives in `server/services/vapid-keys.js`
- Plugin RPC proxying
  - Requests are forwarded to local plugin subprocesses via `/api/plugins/:name/rpc/*` in `server/routes/plugins.js`
- GitHub branch/PR creation
  - Outbound REST calls and `git push` happen in `server/routes/agent.js`

---
*Integration audit: 2026-03-16*
*Update when adding/removing external services*
