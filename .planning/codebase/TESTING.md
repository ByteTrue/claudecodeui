# Testing Patterns

**Analysis Date:** 2026-03-16

## Test Framework

**Runner:**
- No automated unit, integration, or end-to-end test runner is currently committed
- No `test` or `test:*` scripts are defined in `package.json`

**Assertion Library:**
- None detected in the committed codebase

**Current quality commands:**
```bash
npm run lint        # ESLint checks for frontend source
npm run typecheck   # TypeScript validation for src/ and shared/
npm run build       # Production frontend build
npm run dev         # Manual end-to-end verification with server + Vite
```

## Test File Organization

**Location:**
- No `tests/`, `__tests__/`, `*.test.*`, `*.spec.*`, Playwright, Vitest, Jest, or Cypress files were found

**Implication:**
- There is no established automated test layout to follow yet
- Any new test strategy will need to define its own structure before it can be repeated consistently

## Current Verification Style

**Manual regression checks appear to be the default:**
- Start the full stack with `npm run dev`
- Exercise the main UI surfaces: chat, files, shell, git, settings, onboarding, and plugins
- Validate backend behavior through the SPA and the REST/WebSocket routes exposed by `server/index.js`

**High-value areas for manual smoke testing:**
- `src/components/chat/**` with provider selection and message streaming
- `src/components/file-tree/**` for browsing, editing, rename, delete, and upload flows
- `src/components/shell/**` and `src/components/standalone-shell/**` for PTY connectivity
- `src/components/git-panel/**` for diffs, commit flows, and branch operations
- `src/components/project-creation-wizard/**` and `server/routes/projects.js` for workspace creation

## Mocking

**Established framework:**
- None committed

**Likely seams for future test doubles:**
- Browser `fetch` calls behind `src/utils/api.js`
- WebSocket behavior in `src/contexts/WebSocketContext.tsx`
- Provider adapters in `server/claude-sdk.js`, `server/openai-codex.js`, `server/cursor-cli.js`, and `server/gemini-cli.js`
- Filesystem, `git`, and `node-pty` operations in `server/index.js`, `server/routes/git.js`, and `server/routes/projects.js`

## Fixtures and Factories

**Current state:**
- No shared fixtures or test factories are committed
- Representative runtime data comes from real provider directories and the local SQLite database rather than a dedicated fixture system

## Coverage

**Requirements:**
- No automated coverage target is configured
- No CI step enforces test execution or coverage thresholds

**Configuration:**
- None detected for Jest, Vitest, Playwright, or NYC

## Test Types

**Unit Tests:**
- Not present

**Integration Tests:**
- Not present

**E2E Tests:**
- Not present

**Closest existing substitutes:**
- Lint/typecheck/build commands in `package.json`
- Manual browser verification against the full local stack

## Practical Guidance For Future Tests

**If you introduce the first automated tests, align them with current code seams:**
- Frontend component and hook tests should live close to the owning feature folder in `src/components/**` or `src/hooks/**`
- Backend integration tests should target route modules in `server/routes/*.js` and the monolithic flows in `server/index.js`
- Provider-facing tests will need stable mocks for SDKs, CLI subprocesses, and WebSocket writers

**Highest-risk gaps today:**
- Provider session execution and reconnection flows
- Filesystem watcher driven project refreshes
- Git and file-mutation endpoints
- Plugin install / start / proxy lifecycle

---
*Testing analysis: 2026-03-16*
*Update when automated tests or patterns are introduced*
