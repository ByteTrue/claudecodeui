# Technology Stack

**Analysis Date:** 2026-03-16

## Languages

**Primary:**
- TypeScript 5.9 - Main frontend application code in `src/**/*.ts` and `src/**/*.tsx`
- JavaScript (ES modules) - Server runtime, shared model constants, config, and legacy frontend modules in `server/**/*.js`, `shared/modelConstants.js`, and `src/**/*.js`

**Secondary:**
- SQL - SQLite schema and migrations in `server/database/init.sql`
- JSON - Locale packs and configuration payloads in `src/i18n/locales/**` and root config files
- Markdown - User docs and plugin/task docs in `README.md`, localized READMEs, and `src/components/chat/tools/README.md`

## Runtime

**Environment:**
- Node.js 22+ recommended for self-hosted usage according to `README.md`
- Browser runtime for the SPA served from `dist/`
- ESM package runtime via `"type": "module"` in `package.json`

**Package Manager:**
- npm
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- React 18.2 - UI composition in `src/App.tsx` and feature folders under `src/components/`
- Express 4.18 - REST API and static asset host in `server/index.js`
- `ws` 8.x - Shared WebSocket server for `/ws` chat and `/shell` terminal transport in `server/index.js`

**Testing:**
- No dedicated test framework is currently configured in `package.json`
- Verification is currently lint/typecheck oriented: `npm run lint`, `npm run typecheck`

**Build/Dev:**
- Vite 7 - Frontend dev server, proxying, and bundling in `vite.config.js`
- TypeScript 5.9 - Type checking with `strict: true` and `allowJs: true` in `tsconfig.json`
- Tailwind CSS 3.4 - Utility styling configured in `tailwind.config.js`
- ESLint 9 + `typescript-eslint` - Static analysis configured in `eslint.config.js`

## Key Dependencies

**Critical:**
- `@anthropic-ai/claude-agent-sdk` - Claude provider integration in `server/claude-sdk.js`
- `@openai/codex-sdk` - Codex provider integration in `server/openai-codex.js`
- `express` - HTTP API host and route composition in `server/index.js`
- `react` and `react-router-dom` - SPA rendering and session routing in `src/App.tsx`
- `better-sqlite3` - Local auth/settings/session metadata database in `server/database/db.js`
- `node-pty` - Interactive shell/PTY support for the terminal UI in `server/index.js`
- `ws` - WebSocket transport for live chat updates and shell streaming in `server/index.js`

**Infrastructure:**
- `chokidar` - Provider project/session filesystem watchers in `server/index.js`
- `web-push` - Browser push notification delivery in `server/services/notification-orchestrator.js`
- `@octokit/rest` - GitHub PR/branch helpers in `server/routes/agent.js`
- `sqlite` + `sqlite3` - Cursor chat/session discovery in `server/projects.js` and `server/routes/cursor.js`
- `@uiw/react-codemirror` and CodeMirror language packages - Embedded editor in `src/components/code-editor/`
- `@xterm/xterm` and addons - Terminal surface in `src/components/shell/`

## Configuration

**Environment:**
- `.env.example` documents `PORT`, `VITE_PORT`, `HOST`, `DATABASE_PATH`, `CONTEXT_WINDOW`, and `VITE_CONTEXT_WINDOW`
- Additional runtime env lookups include `JWT_SECRET`, `API_KEY`, `WORKSPACES_ROOT`, `CLAUDE_CLI_PATH`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, and `VITE_IS_PLATFORM`
- Server env loading starts in `server/load-env.js` via `server/index.js`

**Build:**
- `vite.config.js` - Frontend dev proxy and chunk splitting
- `tsconfig.json` - TypeScript compiler behavior for `src`, `shared`, and `vite.config.js`
- `eslint.config.js` - lint rules for JS/TS React code
- `tailwind.config.js` and `postcss.config.js` - styling pipeline

## Platform Requirements

**Development:**
- Local machine with Node.js, npm, and installed CLIs/providers the app shells out to (`claude`, `codex`, `cursor`, `gemini`) depending on enabled features
- Browser with WebSocket and service worker support for the full UX (`src/contexts/WebSocketContext.tsx`, `public/sw.js`)

**Production:**
- Single Node.js host serving both the API and built Vite assets from `server/index.js`
- Writable local filesystem for SQLite, plugin installs, session metadata, and provider config directories under the user home directory

---
*Stack analysis: 2026-03-16*
*Update after major dependency changes*
