# Codebase Structure

**Analysis Date:** 2026-03-16

## Directory Layout

```text
claudecodeui/
├── .codex/                 # GSD workflows, skills, templates, and local agent assets
├── .github/                # Repository automation (release notification workflow)
├── .planning/              # Generated planning/codebase documents
├── plugins/                # Example/local plugin sources (`plugins/starter`)
├── public/                 # Static assets, screenshots, icons, service worker, API docs
├── scripts/                # Setup and packaging helper scripts
├── server/                 # Node/Express backend, provider bridges, DB, routes, services
├── shared/                 # Shared constants used by client/server (`shared/modelConstants.js`)
├── src/                    # Frontend SPA source code
├── package.json            # Project manifest and scripts
├── tsconfig.json           # TypeScript compiler config
├── vite.config.js          # Vite dev/build config
└── README.md               # Primary user documentation
```

## Directory Purposes

**server/**
- Purpose: Backend application runtime
- Contains: API route modules, provider adapters, database code, middleware, services, and server utilities
- Key files: `server/index.js`, `server/claude-sdk.js`, `server/openai-codex.js`, `server/projects.js`
- Subdirectories: `routes/`, `database/`, `middleware/`, `services/`, `utils/`, `constants/`

**src/**
- Purpose: Frontend application code
- Contains: React components, contexts, hooks, utilities, styles, and type definitions
- Key files: `src/App.tsx`, `src/main.jsx`, `src/index.css`, `src/hooks/useProjectsState.ts`
- Subdirectories: `components/`, `contexts/`, `hooks/`, `i18n/`, `shared/`, `types/`, `utils/`

**src/components/**
- Purpose: Feature-organized UI modules
- Contains: Feature folders like `chat`, `file-tree`, `git-panel`, `shell`, `settings`, `auth`, `task-master`
- Key files: `src/components/app/AppContent.tsx`, `src/components/main-content/view/MainContent.tsx`
- Subdirectories: Most features use nested `view/`, `hooks/`, `types/`, `utils/`, `constants/`

**public/**
- Purpose: Static assets served directly by Express
- Contains: `sw.js`, screenshots, icons, logo assets, and `api-docs.html`
- Key files: `public/sw.js`, `public/logo.svg`
- Subdirectories: `icons/`, `screenshots/`

**plugins/**
- Purpose: Plugin development/reference area inside the repo
- Contains: starter plugin scaffold
- Key files: `plugins/starter/*`
- Subdirectories: plugin-specific

**shared/**
- Purpose: Cross-runtime shared module(s)
- Contains: `shared/modelConstants.js`
- Key files: `shared/modelConstants.js`
- Subdirectories: None currently

## Key File Locations

**Entry Points:**
- `server/index.js`: Main server startup, route mounting, WebSocket handling, static hosting
- `server/cli.js`: Packaged CLI entry
- `src/main.jsx`: Frontend mount point
- `src/App.tsx`: Top-level provider tree and routes

**Configuration:**
- `package.json`: dependencies, scripts, published files, CLI bin names
- `.env.example`: documented runtime env vars
- `vite.config.js`: dev proxy and chunk splitting
- `tsconfig.json`: TS compiler behavior
- `eslint.config.js`: lint rules
- `tailwind.config.js`: design tokens/content scan config

**Core Logic:**
- `server/routes/`: REST API modules
- `server/projects.js`: project/session discovery across providers
- `server/database/`: SQLite schema and helpers
- `server/utils/`: plugin loading, MCP detection, helper utilities
- `src/components/chat/`: main conversation UI and provider UX
- `src/components/file-tree/`: file browser/editor launch flows
- `src/components/git-panel/`: Git status/history/branch views
- `src/components/shell/`: terminal UI and transport hooks

**Testing:**
- No dedicated `tests/` tree found
- No colocated `*.test.*` or `*.spec.*` files were found in the repository

**Documentation:**
- `README.md` and localized README files
- `public/api-docs.html`: API usage documentation
- `.codex/get-shit-done/`: workflow/reference/template documentation used by GSD

## Naming Conventions

**Files:**
- `PascalCase.tsx` for most React view components, such as `ChatInterface.tsx` and `ShellHeader.tsx`
- `useSomething.ts[x]` for hooks, such as `useProjectsState.ts` and `useShellRuntime.ts`
- `types.ts`, `constants.ts`, `utils.ts` for feature-local supporting modules
- Lowercase or kebab-style `.js` files for server/runtime modules such as `server/openai-codex.js`

**Directories:**
- Kebab-case feature directories in `src/components/` like `file-tree`, `git-panel`, `provider-auth`
- Lowercase server groupings like `routes`, `database`, `middleware`, `services`, `utils`

**Special Patterns:**
- `index.ts` / `index.tsx` barrels appear for some features, such as `src/components/auth/index.ts`
- `view/subcomponents/` is commonly used for nested presentation breakdowns

## Where to Add New Code

**New Frontend Feature:**
- Primary code: add a feature folder under `src/components/`
- Shared cross-feature state: `src/contexts/` or `src/hooks/`
- Server backing APIs: `server/routes/` plus supporting modules under `server/services/` or `server/utils/`

**New Component/Module:**
- Implementation: `src/components/<feature>/view/`
- Local hook/state: `src/components/<feature>/hooks/`
- Types/constants/utils: sibling `types/`, `constants/`, and `utils/` folders when the feature already follows that pattern

**New Route/Backend Capability:**
- Route definition: `server/routes/<domain>.js`
- Shared backend logic: `server/services/` for domain behavior or `server/utils/` for reusable helpers
- Middleware/auth concerns: `server/middleware/`

**Utilities:**
- Frontend shared helpers: `src/utils/` or `src/lib/`
- Shared type definitions: `src/types/`
- Cross-runtime constants: `shared/`

## Special Directories

**.planning/**
- Purpose: Generated planning and mapping artifacts
- Source: GSD workflows
- Committed: Yes in this repository state

**plugins/starter/**
- Purpose: Reference plugin/example scaffold
- Source: maintained in repo for plugin development
- Committed: Yes

**public/**
- Purpose: Directly served assets and service worker
- Source: static source files, not generated at runtime
- Committed: Yes

---
*Structure analysis: 2026-03-16*
*Update when directory structure changes*
