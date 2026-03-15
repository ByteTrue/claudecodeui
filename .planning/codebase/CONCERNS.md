# Codebase Concerns

**Analysis Date:** 2026-03-16

## Tech Debt

**Monolithic backend entrypoint:**
- Issue: `server/index.js` is about 2555 lines and mixes startup, middleware, routes, uploads, file operations, shell handling, and WebSocket orchestration
- Why: The project grew feature-by-feature inside a single runtime file
- Impact: High merge risk, difficult onboarding, and fragile edits because unrelated flows share the same file
- Fix approach: continue extracting domains into `server/routes/`, `server/services/`, and focused modules until `server/index.js` becomes composition-only

**Very large route modules:**
- Issue: `server/routes/taskmaster.js`, `server/routes/git.js`, and `server/routes/agent.js` are each large orchestrators instead of thin route layers
- Why: Route handlers own business logic, subprocess calls, and response shaping directly
- Impact: Hard to test in isolation and easy to introduce regressions when adding one more endpoint
- Fix approach: move provider/git/taskmaster operations into service modules with narrower responsibilities

**Mixed-language boundary:**
- Issue: frontend code is split across TypeScript and JavaScript, while the server is entirely JavaScript
- Why: the codebase has been incrementally migrated rather than rewritten
- Impact: shared contracts between `src/utils/api.js` and `server/routes/*.js` are only loosely typed
- Fix approach: define shared DTO types or schemas and gradually convert critical server modules to TypeScript or runtime validation

**Manual i18n resource registration:**
- Issue: `src/i18n/config.js` manually imports every locale/namespace pair
- Why: straightforward initial setup
- Impact: adding a locale or namespace is easy to forget, and coverage can drift between languages
- Fix approach: generate resource maps or centralize locale manifests instead of hand-maintaining every import

## Known Bugs / Observed Risk Areas

**Project discovery depends on provider-specific filesystem layouts:**
- Symptoms: session lists can break if external CLIs change their on-disk formats or if projects are moved
- Trigger: provider upgrades or path changes outside the app
- Workaround: manually re-add projects and refresh discovery
- Root cause: `server/projects.js` decodes provider state from home-directory files and Cursor hash conventions

**Watcher refreshes can overreact on noisy directories:**
- Symptoms: repeated `projects_updated` broadcasts and unnecessary rescans
- Trigger: bursts of writes inside watched provider directories
- Workaround: debounce is already present, but not all rescans are avoided
- Root cause: `server/index.js` clears caches and reruns `getProjects()` on filesystem events

## Security Considerations

**JWTs live in browser localStorage and WebSocket query strings:**
- Risk: token exposure through XSS, browser tooling, or logs
- Current mitigation: server-side JWT validation in `server/middleware/auth.js`
- Recommendations: prefer httpOnly cookies or a short-lived socket token exchange if auth is tightened further

**Plugin installation is a code-execution trust boundary:**
- Risk: installing a plugin from git ultimately downloads and can execute third-party code through plugin servers
- Current mitigation: manifest validation, path checks, and dedicated plugin directories in `server/utils/plugin-loader.js`
- Recommendations: document plugin trust expectations clearly and consider stronger sandboxing or plugin allowlists

**High-privilege filesystem and subprocess routes:**
- Risk: regressions in path validation can become destructive because routes touch git, the local filesystem, and subprocess execution
- Current mitigation: explicit validation helpers in `server/routes/projects.js` and `server/routes/git.js`
- Recommendations: keep path validation centralized, add regression tests before broadening these endpoints, and review any new shell/file surface carefully

## Performance Bottlenecks

**Full project rescans on watcher events:**
- Problem: the server recalculates the full project list after provider directory changes
- Measurement: no benchmark is committed, but the design is O(all discovered projects and sessions) per refresh
- Cause: `getProjects()` is the single refresh path
- Improvement path: incrementally update changed providers or cache session metadata more aggressively

**Large initial client payloads:**
- Problem: the client eagerly loads multiple heavy feature systems plus translation resources
- Measurement: no bundle report is committed, but Vite manual chunking in `vite.config.js` indicates bundle size is already a concern
- Cause: CodeMirror, xterm, markdown rendering, and all locale resources are part of the frontend package
- Improvement path: lazy-load more feature surfaces and move locale/resource loading behind async boundaries

## Fragile Areas

**WebSocket protocol coupling:**
- Why fragile: message types are stringly typed across `server/index.js`, `src/contexts/WebSocketContext.tsx`, and multiple chat/shell features
- Common failures: adding or renaming a message type without updating both ends breaks UI behavior silently
- Safe modification: update both transport ends together and manually smoke-test reconnect, abort, and permission flows
- Test coverage: no automated coverage detected

**Provider adapter behavior:**
- Why fragile: each provider has distinct transport semantics, session IDs, and abort behavior
- Common failures: resume/abort edge cases, event-shape mismatches, and notification cleanup leaks
- Safe modification: compare behavior across `server/claude-sdk.js`, `server/openai-codex.js`, `server/cursor-cli.js`, and `server/gemini-cli.js` before changing shared assumptions
- Test coverage: no automated coverage detected

**Shell / PTY handling:**
- Why fragile: PTY lifecycle, URL parsing, and browser transport all meet inside `server/index.js`
- Common failures: orphaned sessions, broken terminal reconnects, and malformed URL extraction
- Safe modification: test `/shell` end-to-end with a real PTY after any change
- Test coverage: no automated coverage detected

## Scaling Limits

**Single-process architecture:**
- Current capacity: one Node process owns HTTP, WebSocket, watchers, PTYs, notifications, and local SQLite access
- Limit: horizontal scaling is not straightforward because runtime state is held in memory
- Symptoms at limit: session-state drift, duplicate watchers, and DB contention if multiple instances are introduced
- Scaling path: move session/process coordination and durable state into services that can survive multiple app instances

**Local-storage-based discovery model:**
- Current capacity: best suited to one machine or one mounted workspace environment
- Limit: project/session discovery depends on local home directories and local filesystem access
- Symptoms at limit: harder remote deployment and weaker separation between app state and host state
- Scaling path: formalize provider/session ingestion behind stable APIs instead of direct filesystem reads

## Dependencies At Risk

**Native Node modules:**
- Risk: `node-pty` and `better-sqlite3` are native modules that can become painful during Node upgrades or cross-platform packaging
- Impact: terminal and database features can fail at install time
- Migration plan: keep Node version support explicit and isolate native-module assumptions behind small wrappers

**Fast-moving provider SDKs / CLIs:**
- Risk: `@anthropic-ai/claude-agent-sdk`, `@openai/codex-sdk`, and external CLIs evolve quickly
- Impact: message/event format changes can break session rendering or auth flows
- Migration plan: keep adapter modules narrow and avoid leaking provider-specific event shapes into the broader UI

## Missing Critical Features

**Automated regression suite:**
- Problem: there is no committed automated test harness for core chat, shell, git, or file editing flows
- Current workaround: lint, typecheck, build, and manual QA
- Blocks: safe refactors of large orchestrator files
- Implementation complexity: medium to high because provider and PTY dependencies need controlled test seams

**Shared API contract validation:**
- Problem: frontend/server payloads are coordinated implicitly rather than through shared schemas
- Current workaround: rely on ad hoc TS types in the frontend and careful manual edits on the backend
- Blocks: faster endpoint evolution and safer refactors
- Implementation complexity: medium

## Test Coverage Gaps

**Provider execution flows:**
- What's not tested: start, stream, resume, abort, and reconnect behavior across providers
- Risk: changes can silently break live chat sessions
- Priority: High
- Difficulty to test: requires SDK/CLI doubles and socket transport harnesses

**Filesystem mutation routes:**
- What's not tested: file create/rename/delete/upload, workspace creation, and git operations
- Risk: destructive regressions on user workspaces
- Priority: High
- Difficulty to test: requires temp repos, temp directories, and platform-aware subprocess fixtures

**Watcher-driven project refresh logic:**
- What's not tested: chokidar event handling and the `projects_updated` reconciliation path
- Risk: stale or noisy project lists in the UI
- Priority: Medium
- Difficulty to test: requires synthetic filesystem events and websocket assertions

---
*Concerns audit: 2026-03-16*
*Update as issues are fixed or new ones are discovered*
