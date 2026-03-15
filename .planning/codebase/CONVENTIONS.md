# Coding Conventions

**Analysis Date:** 2026-03-16

## Naming Patterns

**Files:**
- React view components use `PascalCase.tsx`, for example `src/components/chat/view/ChatInterface.tsx`
- Hooks use `useXxx.ts` or `useXxx.tsx`, for example `src/hooks/useProjectsState.ts` and `src/components/chat/hooks/useChatRealtimeHandlers.ts`
- Server/runtime modules are usually lowercase or kebab-style `.js`, for example `server/openai-codex.js` and `server/plugin-process-manager.js`
- Feature support files frequently use canonical names like `types.ts`, `constants.ts`, `utils.ts`, or `index.ts`

**Functions:**
- camelCase for general helpers and handlers, such as `validateWorkspacePath`, `refreshProjectsSilently`, and `handleWebSocketReconnect`
- Event handlers typically use `handleXxx` naming in React components and server code
- Async functions do not use a special prefix; they rely on `async`/`await`

**Variables:**
- camelCase for regular values
- UPPER_SNAKE_CASE for shared constants like `VALID_PROVIDERS`, `WATCHER_DEBOUNCE_MS`, and `AUTH_TOKEN_STORAGE_KEY`
- refs in React commonly end with `Ref`, e.g. `pendingViewSessionRef`, `terminalRef`

**Types:**
- PascalCase for TypeScript types and interfaces, e.g. `Project`, `ProjectSession`, `AuthContextValue`
- No `I` prefix convention
- Broad `any` is still allowed in places; ESLint explicitly turns off `@typescript-eslint/no-explicit-any`

## Code Style

**Formatting:**
- Semicolons are consistently used
- Single quotes are the dominant string style in both client and server
- Indentation is generally two spaces in frontend TSX and two/four spaces in older server JS modules
- Mixed JS/TS codebase: TypeScript is strict, but JavaScript files are still first-class via `allowJs: true`

**Linting:**
- ESLint flat config in `eslint.config.js`
- React, hooks, import ordering, Tailwind class ordering, and unused import plugins are enabled
- `import-x/order` is configured with `newlines-between: "never"`
- Run with `npm run lint`

## Import Organization

**Order:**
1. External packages
2. Internal project modules
3. Relative imports
4. Type imports are used selectively, not universally separated

**Grouping:**
- The repo usually keeps imports tightly packed with no blank line between groups, matching ESLint config
- Sorting is partially automated/enforced by lint rules but not perfectly alphabetized everywhere

**Path Aliases:**
- No custom TypeScript path aliases were found
- Imports are predominantly relative (`../`, `./`) or package imports

## Error Handling

**Patterns:**
- Server routes commonly use `try/catch` and respond with `{ error, details/message }` JSON, e.g. `server/routes/auth.js` and `server/routes/plugins.js`
- WebSocket handlers catch per-message errors and emit error events back to the client from `server/index.js`
- Frontend hooks often log and fail open rather than throwing, especially around auth, onboarding, push, and reconnect logic

**Error Types:**
- Plain `Error` objects and ad-hoc error payloads are the norm; there is no custom error-class hierarchy
- Expected validation failures usually return HTTP 400/401/403/404 directly at the route boundary
- Console logging with context is preferred over structured logger abstractions

## Logging

**Framework:**
- `console.log`, `console.warn`, and `console.error`
- No dedicated logging library was found

**Patterns:**
- Logs are common around provider invocation, startup, plugins, and filesystem/watcher behavior
- Some debug logging is very verbose in `server/index.js`, especially around uploads and WebSocket/provider traffic
- Client hooks also log recoverable failures instead of surfacing them all to the UI

## Comments

**When to Comment:**
- Comments often explain operational intent or edge cases, especially in server orchestration code
- Many comments are pragmatic and maintenance-focused, for example watcher behavior and reconnect reasoning in `server/index.js` and `src/components/chat/hooks/useChatRealtimeHandlers.ts`

**JSDoc/TSDoc:**
- Public-ish server utilities and route helpers often use block comments/JSDoc-style descriptions
- Frontend component files use lighter inline comments or no comments when the flow is straightforward

**TODO Comments:**
- TODO usage is sparse; one visible example is in `src/components/chat/tools/configs/toolConfigs.ts`
- There is no enforced `TODO(owner)` pattern

## Function Design

**Size:**
- Frontend hooks are split into focused responsibilities, but some orchestration files are large (`src/hooks/useProjectsState.ts`)
- Backend functions can be large and procedural, especially in `server/index.js` and `server/routes/taskmaster.js`

**Parameters:**
- Object parameter patterns are common in React hooks/components, especially for hook options and prop bags
- Simpler helper functions still use positional parameters

**Return Values:**
- Guard clauses are common
- REST helpers usually return raw `fetch` responses from `src/utils/api.js`
- Server helpers frequently return plain objects rather than domain classes

## Module Design

**Exports:**
- Default exports are common for React components and some singleton-style modules
- Named exports are common for hooks, utilities, constants, and route helpers

**Barrel Files:**
- Barrel `index.ts` files exist for selective public APIs, such as `src/components/auth/index.ts` and `src/shared/view/ui/index.ts`
- Many feature folders are still imported directly from deep relative paths

---
*Convention analysis: 2026-03-16*
*Update when patterns change*
