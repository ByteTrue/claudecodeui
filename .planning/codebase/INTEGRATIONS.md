# External Integrations

**Analysis Date:** 2026-03-16

## APIs & External Services

**Anthropic Claude:**
- Claude Agents SDK - Claude session execution and tool approval flow
  - SDK/Client: `@anthropic-ai/claude-agent-sdk`
  - Integration point: `server/claude-sdk.js`
  - Auth: user-managed Claude CLI / local Claude environment, plus optional `ANTHROPIC_API_KEY` checks in `server/routes/cli-auth.js`

**OpenAI Codex:**
- Codex SDK - Non-interactive Codex thread execution
  - SDK/Client: `@openai/codex-sdk`
  - Integration point: `server/openai-codex.js`
  - Auth: server process reads `OPENAI_API_KEY` where needed in `server/index.js`

**Cursor CLI:**
- Local Cursor CLI subprocess execution
  - Integration method: `child_process.spawn` from `server/cursor-cli.js` and `server/routes/cursor.js`
  - Auth: user's local Cursor CLI environment

**Gemini CLI:**
- Local Gemini CLI subprocess execution
  - Integration method: `child_process.spawn` from `server/gemini-cli.js`
  - Auth: local Gemini CLI environment and optional `GEMINI_API_KEY`
  - Binary override: `GEMINI_PATH` in `server/gemini-cli.js`

**GitHub:**
- GitHub repository cloning and metadata access
  - SDK/Client: `@octokit/rest` plus `git` CLI
  - Integration points: `server/routes/agent.js` and `server/routes/projects.js`
  - Auth: stored GitHub tokens in the local SQLite DB, or one-time token values passed through the workspace wizard

**Claude MCP CLI:**
- MCP server management against the local Claude installation
  - Integration method: `claude mcp ...` subprocesses from `server/routes/mcp.js`
  - Scope support: user and project-local MCP configuration

## Data Storage

**Databases:**
- Local SQLite - Authentication, onboarding, API keys, push subscriptions, session naming, and app config
  - Connection: `DATABASE_PATH` or default `~/.cloudcli/auth.db`
  - Client: `better-sqlite3` in `server/database/db.js`
  - Migrations: schema bootstrap in `server/database/init.sql` plus runtime migrations in `server/database/db.js`

- Cursor session SQLite stores - Read-only discovery of Cursor sessions
  - Connection: files under `~/.cursor/chats/*/store.db`
  - Client: `sqlite3` + `sqlite` in `server/projects.js`

**File Storage:**
- Local project files - Read/write operations for the file tree and editor in routes inside `server/index.js`
- Provider session stores - Home-directory data read by `server/projects.js`
- Plugin install root - `~/.claude-code-ui/plugins` managed by `server/utils/plugin-loader.js`
- Plugin config - `~/.claude-code-ui/plugins.json`

**Caching / In-Memory State:**
- No external cache service
- In-memory maps track active sessions, pending approvals, PTY sessions, push dedupe keys, and project-directory cache in `server/index.js`, `server/claude-sdk.js`, `server/openai-codex.js`, and `server/projects.js`

## Authentication & Identity

**Primary auth provider:**
- Custom JWT auth for OSS mode
  - Implementation: `server/middleware/auth.js`
  - Token storage: browser `localStorage` via `src/components/auth/context/AuthContext.tsx` and `src/utils/api.js`
  - Session management: Bearer tokens on REST, query-string token on WebSocket

**Secondary auth modes:**
- Platform mode bypass using `VITE_IS_PLATFORM` in `server/constants/config.js` and `src/constants/config.ts`
- External agent API keys validated from `server/routes/agent.js`
- Optional global API key gate via `API_KEY` in `server/middleware/auth.js`

## Monitoring & Observability

**Logs:**
- No external logging provider detected
- Operational logging uses `console.log`, `console.warn`, and `console.error` in server and client code

**Notifications:**
- Browser Web Push notifications
  - Integration: `web-push` in `server/services/notification-orchestrator.js`
  - Key management: VAPID keys in `server/services/vapid-keys.js`

**Error tracking / analytics:**
- No Sentry, Datadog, Mixpanel, or similar service detected in the repository

## CI/CD & Deployment

**Hosting model:**
- Self-hosted Node server that serves `dist/` when built and proxies to Vite in development
  - Entry points: `server/cli.js` and `server/index.js`
  - Frontend build: `npm run build`

**CI pipeline:**
- GitHub Actions present, but only release notification automation is committed
  - Workflow: `.github/workflows/discord-release.yml`
  - No committed CI test workflow found

## Environment Configuration

**Development:**
- Critical variables include `PORT`, `HOST`, `VITE_PORT`, `DATABASE_PATH`, `JWT_SECRET`, `API_KEY`, `WORKSPACES_ROOT`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, `GEMINI_PATH`, `CONTEXT_WINDOW`, and `VITE_IS_PLATFORM`
- `.env` is loaded by `server/load-env.js`

**Production:**
- Same variables are consumed directly by the Node process
- No secret manager integration is committed; deployment relies on environment variables

## Webhooks & Callbacks

**Incoming:**
- No third-party webhook endpoints were identified in the committed server routes

**Outgoing:**
- Browser push notifications are sent to stored subscription endpoints from `server/services/notification-orchestrator.js`
- Plugin RPC calls are proxied from `/api/plugins/:name/rpc/*` to local plugin subprocesses in `server/routes/plugins.js`

**Realtime transport:**
- `/ws` - App chat/session WebSocket handled in `server/index.js`
- `/shell` - Terminal/PTY WebSocket handled in `server/index.js`

---
*Integration audit: 2026-03-16*
*Update when adding or removing external services*
