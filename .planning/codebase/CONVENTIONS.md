# Coding Conventions

**Analysis Date:** 2026-03-16

## Naming Patterns

**Files:**
- Feature directories are kebab-case, for example `src/components/file-tree/` and `src/components/project-creation-wizard/`
- React component files are usually `PascalCase.tsx`, especially under `view/`
- Hooks use the `useX` prefix, for example `src/hooks/useProjectsState.ts` and `src/components/chat/hooks/useChatSessionState.ts`
- Utility modules use lowercase or camel-style names such as `src/utils/api.js`, `server/utils/plugin-loader.js`, and `src/lib/utils.js`

**Functions:**
- Functions use camelCase across both client and server
- Event handlers commonly use `handleX` naming, for example `handleProjectCreated` in `src/components/sidebar/view/Sidebar.tsx`
- Async functions are named by action rather than `fetch`/`async` prefixes only, for example `checkAuthStatus`, `refreshProjectsSilently`, and `validateWorkspacePath`

**Variables:**
- Local variables use camelCase
- Shared constants use UPPER_SNAKE_CASE, for example `VALID_PROVIDERS`, `WORKSPACES_ROOT`, and `AUTH_TOKEN_STORAGE_KEY`
- React refs use the `SomethingRef` suffix

**Types:**
- Type aliases and interfaces are `PascalCase`
- Type-only imports are used explicitly in many TSX files, for example `import type { Project } from '../../../types/app';`
- There is no `I` prefix convention for interfaces

## Code Style

**Formatting:**
- Single quotes are the default string style across client and server
- Semicolons are used consistently
- React code uses the modern JSX transform (`jsx: react-jsx` in `tsconfig.json`)
- Tailwind utility classes are written inline in JSX

**Linting:**
- ESLint is configured in `eslint.config.js`
- React hooks, import ordering, Tailwind class ordering, and unused imports are enforced or warned on
- Main commands: `npm run lint` and `npm run lint:fix`

## Import Organization

**Order:**
1. External packages
2. Internal project modules
3. Relative imports
4. Type imports, often split out with `import type`

**Grouping:**
- Files usually keep a small number of import groups with blank lines between conceptual sections
- Path aliases are not configured; relative imports are the norm

**Path patterns:**
- Frontend imports are rooted off `src/` via relative paths
- Cross-runtime shared values come from `shared/`, for example `../../shared/modelConstants.js`

## Error Handling

**Patterns:**
- Server routes and service functions commonly use `try/catch` and respond with JSON errors instead of throwing uncaught exceptions
- Frontend hooks and contexts log errors and often fail open to keep the UI usable
- Validation happens near the boundary for paths, auth tokens, and request payloads

**Error types:**
- Custom Error subclasses are not a dominant pattern
- Most code uses plain `Error` objects plus structured JSON responses
- Recoverable UI issues are often handled with `console.error` plus fallback state

## Logging

**Framework:**
- Logging is primarily `console.log`, `console.warn`, and `console.error`
- Server startup code sometimes adds ANSI color helpers and tagged messages, for example in `server/index.js` and `server/database/db.js`

**Patterns:**
- Logs are emitted at integration boundaries: provider execution, filesystem watchers, auth checks, route failures, and startup
- Browser-side logs are used for network, auth, and WebSocket troubleshooting

## Comments

**When to Comment:**
- Comments usually explain why a workaround exists or what external constraint is being handled
- Example: chokidar watcher setup and SDK/tool-approval behavior in `server/index.js` and `server/claude-sdk.js`
- Obvious line-by-line comments are uncommon

**JSDoc / TSDoc:**
- Server modules use JSDoc heavily around exported helpers and route utilities
- Frontend TSX code relies more on names and types than block comments

**TODO Comments:**
- TODO usage is sparse; one visible example is in `src/components/chat/tools/configs/toolConfigs.ts`

## Function Design

**Size:**
- Small helper functions exist, but large orchestrator files are also common (`server/index.js`, `server/routes/taskmaster.js`, `server/routes/git.js`)
- Complex UI state is often extracted into hooks/controllers rather than kept in the view file

**Parameters:**
- Multi-option flows often take a single options object, especially in provider adapters and hooks
- Route helpers typically accept explicit scalar parameters for path/ref validation

**Return Values:**
- Early returns are common for guard clauses
- Async flows usually return plain objects or Express responses rather than custom result wrappers

## Module Design

**Exports:**
- Default exports are common for React components and some context modules
- Named exports are preferred for utilities, hooks, constants, and server helpers

**Barrel files:**
- Some features use `index.ts` for public exports, for example `src/components/auth/index.ts` and `src/shared/view/ui/index.ts`
- Not every directory has a barrel; many imports target concrete files directly

**Feature organization:**
- UI code favors feature folders with `view/`, `hooks/`, `types/`, `utils/`, and `constants/`
- Backend code favors responsibility-based folders such as `routes/`, `services/`, `middleware/`, and `utils/`

---
*Convention analysis: 2026-03-16*
*Update when patterns change*
