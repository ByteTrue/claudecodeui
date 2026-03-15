# Codebase Structure

**Analysis Date:** 2026-03-16

## Directory Layout

```text
claudecodeui/
├── .codex/             # GSD workflows, skills, and command resources
├── .github/            # Repo metadata and release workflow
├── .husky/             # Git hook scripts
├── plugins/            # Example plugin assets checked into the repo
├── public/             # Static assets, service worker, icons, screenshots
├── scripts/            # Maintenance/install helper scripts
├── server/             # Node backend, provider adapters, routes, DB, services
├── shared/             # Shared runtime constants used by server and client
├── src/                # React frontend source
├── package.json        # Scripts and dependency manifest
├── vite.config.js      # Vite dev/build configuration
├── tsconfig.json       # TypeScript configuration
└── README.md           # Product and setup documentation
```

## Directory Purposes

**server/**
- Purpose: backend runtime and orchestration layer
- Contains: `index.js`, `cli.js`, provider adapters, route modules, middleware, DB access, utility services
- Key files: `server/index.js`, `server/claude-sdk.js`, `server/openai-codex.js`, `server/projects.js`, `server/database/db.js`
- Subdirectories: `routes/`, `database/`, `middleware/`, `services/`, `utils/`, `constants/`

**src/**
- Purpose: React SPA source
- Contains: feature modules, contexts, hooks, shared UI primitives, translations, client utilities
- Key files: `src/main.jsx`, `src/App.tsx`, `src/hooks/useProjectsState.ts`, `src/contexts/WebSocketContext.tsx`, `src/utils/api.js`
- Subdirectories: `components/`, `contexts/`, `hooks/`, `shared/`, `i18n/`, `types/`, `utils/`

**src/components/**
- Purpose: feature-level UI organization
- Contains: one folder per major surface such as `chat`, `file-tree`, `git-panel`, `shell`, `settings`, `sidebar`, `task-master`
- Key files: feature-specific `view/*.tsx`, hooks, constants, utilities, and sometimes `index.ts`
- Subdirectories: typically `view/`, `hooks/`, `types/`, `utils/`, `constants/`

**shared/**
- Purpose: values shared across runtimes without importing the whole frontend
- Contains: model metadata in `shared/modelConstants.js`
- Key files: `shared/modelConstants.js`
- Subdirectories: none

**public/**
- Purpose: non-bundled static assets
- Contains: icons, screenshots, `manifest.json`, `sw.js`, static HTML helpers
- Key files: `public/sw.js`, `public/manifest.json`, `public/api-docs.html`
- Subdirectories: `icons/`, `screenshots/`

**plugins/**
- Purpose: checked-in plugin examples or starter assets
- Contains: `plugins/starter/**`
- Key files: repo currently exposes the directory but no runtime plugin state is stored here
- Subdirectories: `starter/`

**.codex/**
- Purpose: Codex/GSD workflows, templates, and skills used by agents
- Contains: `get-shit-done/`, `skills/`, `agents/`
- Key files: workflow and template markdown under `.codex/get-shit-done/**`

## Key File Locations

**Entry Points:**
- `src/main.jsx` - Browser bootstrap
- `src/App.tsx` - Provider composition and routing
- `server/cli.js` - Published CLI binary entry
- `server/index.js` - Express/WebSocket server startup

**Configuration:**
- `package.json` - Scripts, dependencies, npm metadata
- `vite.config.js` - Vite host/proxy/build settings
- `tsconfig.json` - TS compiler options
- `eslint.config.js` - Lint rules
- `server/load-env.js` - `.env` loading

**Core Logic:**
- `server/projects.js` - Provider project and session discovery
- `server/routes/*.js` - REST API modules
- `server/claude-sdk.js`, `server/openai-codex.js`, `server/cursor-cli.js`, `server/gemini-cli.js` - Provider execution adapters
- `src/components/**` - User-facing features
- `src/utils/api.js` - Browser REST client

**Testing / Quality Gates:**
- No committed `tests/`, `__tests__/`, `*.test.*`, Playwright, or Vitest tree was found
- Current quality commands live in `package.json`: `npm run lint`, `npm run typecheck`, `npm run build`

**Documentation:**
- `README.md` and localized README variants
- `.codex/get-shit-done/**` for workflow docs

## Naming Conventions

**Files:**
- React components use `PascalCase.tsx`, especially under `src/components/**/view/`
- Hooks use `useSomething.ts` or `useSomething.tsx`
- Utility and config modules use lowercase or camel/kebab names such as `api.js`, `plugin-loader.js`, `dateUtils.ts`
- Barrel exports use `index.ts`

**Directories:**
- Feature folders use kebab-case, for example `file-tree`, `git-panel`, `project-creation-wizard`
- Server folders are plural by responsibility: `routes`, `services`, `utils`, `database`

**Special Patterns:**
- UI features commonly follow `view/`, `hooks/`, `types/`, `utils/`, and `constants/`
- Shared UI primitives live under `src/shared/view/ui/`
- Translation namespaces are grouped by locale and feature under `src/i18n/locales/<locale>/`

## Where to Add New Code

**New frontend feature:**
- Primary code: `src/components/<feature>/`
- Shared state: `src/contexts/` or feature-local context
- Shared hooks: `src/hooks/`
- Shared UI primitives: `src/shared/view/ui/`

**New backend API or service:**
- Route definition: `server/routes/<feature>.js`
- Supporting service or helper: `server/services/` or `server/utils/`
- Provider-specific integration: one of the `server/*-cli.js` or SDK adapter modules

**New shared constants or types:**
- Cross-runtime constants: `shared/`
- Frontend-only app types: `src/types/`

**New docs or workflow assets:**
- Planning artifacts: `.planning/`
- Agent/GSD workflow resources: `.codex/get-shit-done/`

## Special Directories

**public/**
- Purpose: service worker and static assets served directly by Express
- Source: committed source files
- Committed: Yes

**dist/**
- Purpose: Vite build output served in production from `server/index.js`
- Source: generated by `npm run build`
- Committed: No

**.planning/codebase/**
- Purpose: generated codebase map for GSD planning
- Source: this mapping pass
- Committed: typically yes when planning docs are tracked

**User-home runtime storage (not in repo):**
- `~/.cloudcli/auth.db` - auth/config DB
- `~/.claude-code-ui/plugins/` - installed plugins
- `~/.claude/`, `~/.cursor/`, `~/.codex/`, `~/.gemini/` - external provider data that the app reads

---
*Structure analysis: 2026-03-16*
*Update when directory structure changes*
