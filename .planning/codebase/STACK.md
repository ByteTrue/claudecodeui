# Technology Stack

**Analysis Date:** 2026-03-16

## Languages

**Primary:**
- TypeScript 5.9 - Most modern client code in `src/**/*.ts` and `src/**/*.tsx`
- JavaScript (ES modules) - Server runtime, legacy client modules, shared constants, and scripts in `server/**/*.js`, `src/**/*.js`, `shared/*.js`, and `scripts/*.js`

**Secondary:**
- JSON - Translation namespaces under `src/i18n/locales/*/*.json`
- CSS - Global styles in `src/index.css`
- SQL - Database schema bootstrap in `server/database/init.sql`

## Runtime

**Environment:**
- Node.js 22+ - Required by the published self-hosted package and the Express backend described in `README.md`
- Browser runtime - React SPA mounted from `src/main.jsx`

**Package Manager:**
- npm - Scripts and dependency lockfile are defined in `package.json`
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- React 18.2 - UI layer rooted at `src/main.jsx` and `src/App.tsx`
- React Router 6 - Session-aware routing in `src/App.tsx`
- Express 4 - HTTP API and static asset server in `server/index.js`
- `ws` - WebSocket transport for chat and shell channels in `server/index.js`

**UI / Interaction:**
- Tailwind CSS 3 - Utility-first styling used throughout `src/**/*.tsx`
- i18next + react-i18next - Localization bootstrap in `src/i18n/config.js`
- CodeMirror 6 - Editor surface in `src/components/code-editor/**`
- xterm.js 5 - Terminal UI in `src/components/shell/**` and `src/components/standalone-shell/**`

**AI / Provider Integration:**
- `@anthropic-ai/claude-agent-sdk` - Claude integration in `server/claude-sdk.js`
- `@openai/codex-sdk` - Codex integration in `server/openai-codex.js`
- Cursor CLI / Gemini CLI subprocess adapters - `server/cursor-cli.js` and `server/gemini-cli.js`

**Build / Dev:**
- Vite 7 - Frontend dev server and bundling in `vite.config.js`
- TypeScript compiler - Type checking via `npm run typecheck`
- ESLint 9 - Linting via `eslint.config.js`
- Concurrently - Dual-process local dev via `npm run dev`

## Key Dependencies

**Critical:**
- `express` - Main API server and static file hosting
- `@anthropic-ai/claude-agent-sdk` - Claude chat/session execution
- `@openai/codex-sdk` - Codex session execution
- `react`, `react-dom`, `react-router-dom` - SPA shell and navigation
- `better-sqlite3` - Local auth/config persistence in `server/database/db.js`
- `node-pty` - Shell/PTTY support in `server/index.js`

**Infrastructure:**
- `ws` - Browser-to-server real-time transport
- `chokidar` - Provider directory watchers in `server/index.js`
- `web-push` - Browser push notifications in `server/services/notification-orchestrator.js`
- `@octokit/rest` - GitHub API access in `server/routes/agent.js`
- `multer`, `mime-types`, `jszip` - Upload and file handling paths in `server/index.js`

## Configuration

**Environment:**
- `.env` is parsed manually in `server/load-env.js`
- Common server vars referenced in code: `PORT`, `HOST`, `VITE_PORT`, `DATABASE_PATH`, `JWT_SECRET`, `API_KEY`, `WORKSPACES_ROOT`, `CONTEXT_WINDOW`, `CLAUDE_TOOL_APPROVAL_TIMEOUT_MS`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, `GEMINI_PATH`, and `VITE_IS_PLATFORM`

**Build:**
- `vite.config.js` - Dev proxying, manual chunking, build output
- `tsconfig.json` - Client/shared TS compiler settings
- `eslint.config.js` - Lint rules for React, hooks, import order, Tailwind, and unused imports

## Platform Requirements

**Development:**
- Node.js 22+ with npm
- Git available on PATH for routes in `server/routes/git.js`, workspace cloning in `server/routes/projects.js`, and plugin install/update flows
- Local provider tooling expected on PATH or in user home directories: Claude, Cursor CLI, Codex, Gemini

**Production / Runtime:**
- Single Node process serving both REST and WebSocket traffic from `server/index.js`
- Writable local filesystem for SQLite, plugin installs, and provider session discovery
- Access to user-home provider directories such as `~/.claude`, `~/.cursor`, `~/.codex`, and `~/.gemini`

---
*Stack analysis: 2026-03-16*
*Update after major dependency or runtime changes*
