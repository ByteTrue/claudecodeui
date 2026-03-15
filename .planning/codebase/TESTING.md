# Testing Patterns

**Analysis Date:** 2026-03-16

## Test Framework

**Runner:**
- No dedicated unit/integration/E2E test runner is currently configured in `package.json`
- No `vitest.config.*`, `jest.config.*`, `playwright.config.*`, or equivalent test config files were found at the repo root

**Assertion Library:**
- None configured in-repo
- Current verification is tool-based rather than assertion-based

**Run Commands:**
```bash
npm run lint        # Lint `src/` with ESLint
npm run typecheck   # Type-check TS/TSX/JS-in-TS-program with `tsc --noEmit`
npm run build       # Build the frontend bundle with Vite
```

## Test File Organization

**Location:**
- No `tests/` directory was found
- No colocated `*.test.*` or `*.spec.*` files were found under `src/`, `server/`, `shared/`, or the repo root

**Naming:**
- There is no established test file naming pattern yet

**Structure:**
```text
Current state:
- Source lives in `src/`, `server/`, and `shared/`
- Automated test files are absent
```

## Test Structure

**Current Practice:**
- Frontend correctness appears to rely on manual UX verification plus lint/typecheck/build
- Backend correctness appears to rely on route-level defensive coding and manual exercise of the UI/CLI flows
- Release automation in `.github/workflows/discord-release.yml` does not run tests

**Patterns:**
- When behavior is safety-sensitive, the code tends to add runtime guards instead of a corresponding test
- Reconnect/session behavior is often hardened in hook logic, for example `src/contexts/WebSocketContext.tsx` and `src/components/chat/hooks/useChatRealtimeHandlers.ts`

## Mocking

**Framework:**
- None configured

**Patterns:**
- No repository-level mocking conventions exist yet

**What to Mock First When Tests Are Added:**
- Provider SDK/CLI boundaries in `server/claude-sdk.js`, `server/openai-codex.js`, `server/cursor-cli.js`, `server/gemini-cli.js`
- Filesystem/home-directory reads in `server/projects.js` and `server/routes/*.js`
- WebSocket and PTY boundaries in `server/index.js` and `src/components/shell/`

## Fixtures and Factories

**Test Data:**
- No fixture or factory directories were found
- Existing code generally builds objects inline rather than through reusable test factories

**Location Recommendation Based on Current Structure:**
- Backend integration fixtures would fit under a new `tests/server/`
- Frontend component/hook tests would fit colocated in `src/components/**` or `src/hooks/**`

## Coverage

**Requirements:**
- No coverage target or enforcement was found

**Configuration:**
- No coverage tooling is configured

**View Coverage:**
```bash
# Not available yet - coverage tooling has not been added
```

## Test Types

**Unit Tests:**
- Not present
- Best candidates: pure helpers in `src/utils/`, `src/lib/`, `server/utils/`, and project/session parsing in `server/projects.js`

**Integration Tests:**
- Not present
- Highest-value future targets: auth flow, project discovery, file operations, Git routes, plugin RPC, and TaskMaster route flows

**E2E Tests:**
- Not present
- High-value user journeys: login/setup, project selection, chat streaming, shell attach, file edit, Git commit flow, plugin enable/install

## Common Patterns

**Current Verification Pattern:**
```text
1. Run `npm run lint`
2. Run `npm run typecheck`
3. Run `npm run build`
4. Manually exercise the affected UI/server flow
```

**Error-Prone Untested Areas:**
- WebSocket reconnect and pending permission recovery
- PTY shell connection lifecycle
- Provider-specific session resume/abort flows
- Plugin install/update/asset/rpc lifecycle

## Recommendations

- Add at least one automated test layer before expanding major features
- Start with fast backend unit/integration coverage around `server/projects.js`, `server/routes/auth.js`, and provider message normalization
- Add focused frontend tests for chat/session state hooks before snapshot-style component coverage

---
*Testing analysis: 2026-03-16*
*Update when test patterns change*
