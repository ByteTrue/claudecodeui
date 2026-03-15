# Codebase Concerns

**Analysis Date:** 2026-03-16

## Tech Debt

**Server orchestration concentrated in one file:**
- Issue: `server/index.js` owns startup, middleware, static serving, file APIs, upload handling, WebSocket routing, PTY transport, and assorted project/file endpoints in one very large module
- Why: Features were layered onto the original server entry instead of being fully extracted into route/service modules
- Impact: High regression risk when touching unrelated behavior; difficult local reasoning and low isolation for refactors
- Fix approach: Continue extracting REST/file/WebSocket subsystems into dedicated modules and leave `server/index.js` as composition/bootstrap only

**Mixed JS/TS boundary with partial typing:**
- Issue: The repo mixes strict TypeScript frontend code with large JavaScript server modules while `tsconfig.json` sets `allowJs: true`
- Why: Incremental migration and legacy server code
- Impact: Cross-layer contracts can drift silently; refactors are harder because server/runtime modules do not benefit from the same type guarantees
- Fix approach: Gradually type critical server modules (`server/index.js`, provider bridges, `server/projects.js`) or introduce typed facade modules at boundaries

**Provider/session state lives in process memory:**
- Issue: Active session maps, pending approvals, plugin process registries, and Gemini session cache are in-memory (`server/claude-sdk.js`, `server/openai-codex.js`, `server/utils/plugin-process-manager.js`, `server/sessionManager.js`)
- Why: Simpler live-session orchestration
- Impact: Server restarts drop transient state and complicate resumability/debugging
- Fix approach: Persist more resumable metadata and keep process memory limited to active transports

## Known Bugs

**Cursor-only project discovery is incomplete by design:**
- Symptoms: Projects that only exist in Cursor can be invisible until manually added
- Trigger: User has Cursor chats for a repo that has no Claude/manual project entry
- Workaround: Add the project manually through the UI so `server/projects.js` can compute the hash and discover sessions
- Root cause: `server/projects.js` documents that Cursor project path cannot be reconstructed reliably from stored data alone

**TaskMaster automation depends on CLI prompt shape:**
- Symptoms: TaskMaster initialization can fail or hang if upstream CLI prompts change
- Trigger: `server/routes/taskmaster.js` posts `'yes\\n'` into spawned CLI processes and assumes the current interaction contract
- Workaround: Run TaskMaster manually when automation breaks
- Root cause: brittle child-process prompt automation rather than a stable programmatic API

## Security Considerations

**Sensitive data can reach logs:**
- Risk: WebSocket chat commands, provider prompts, upload metadata, and path info are logged in `server/index.js`
- Current mitigation: None beyond normal server log access controls
- Recommendations: Gate debug logs behind an env flag, scrub prompts/paths by default, and avoid logging raw user input in production

**JWT tokens may travel in query parameters:**
- Risk: Token-bearing URLs can be captured in logs/history when query-string auth is used
- Current mitigation: Header-based auth is used where possible; query token support exists for EventSource-style cases in `server/middleware/auth.js` and `src/utils/api.js`
- Recommendations: Minimize query-token usage, prefer authenticated fetch/WebSocket headers where supported, and avoid exposing tokenized URLs outside the immediate request

**Plugin installation is trust-based:**
- Risk: Installing a plugin from Git runs third-party Node code on the host
- Current mitigation: Manifest/path validation, restricted child-process env, and local-only RPC proxying in `server/utils/plugin-loader.js` and `server/utils/plugin-process-manager.js`
- Recommendations: Treat plugin install as privileged, add stronger signing/review guidance, and consider sandboxing or permission prompts per plugin capability

## Performance Bottlenecks

**Project rescans on filesystem changes:**
- Problem: Provider watchers in `server/index.js` can trigger a full `getProjects()` refresh whenever watched session/project files change
- Measurement: No benchmark found in-repo
- Cause: Simplicity over incremental diffing; many provider folders are watched at once
- Improvement path: Cache provider/session metadata more aggressively and limit rescans to affected provider/project scopes

**Client-side release polling hits GitHub repeatedly:**
- Problem: Every active client polls GitHub Releases every 5 minutes in `src/hooks/useVersionCheck.ts`
- Measurement: No rate/usage telemetry found
- Cause: Direct browser polling instead of server-side caching
- Improvement path: Cache latest release server-side or reduce frequency/back off after failures

## Fragile Areas

**WebSocket session lifecycle:**
- Why fragile: Multiple providers share one `/ws` transport with provider-specific message types and reconnect behavior
- Common failures: Session state mismatch after reconnect, stale loading flags, provider-specific edge cases during resume/abort
- Safe modification: Keep message contracts explicit and change both `server/index.js` and `src/components/chat/hooks/useChatRealtimeHandlers.ts` together
- Test coverage: No automated coverage found

**Shell/PTY bridge:**
- Why fragile: Browser terminal state, PTY lifecycle, auth URL detection, and reconnect behavior interact across `server/index.js` and `src/components/shell/`
- Common failures: lost terminal state, duplicate sockets, auth URL parsing regressions, platform-specific PTY issues
- Safe modification: Treat server shell handling and `useShellRuntime`/`useShellConnection` as one unit; verify on real terminals
- Test coverage: No automated coverage found

**Filesystem mutation endpoints:**
- Why fragile: Upload/create/rename/delete flows in `server/index.js` combine path normalization, auth, and file IO
- Common failures: path validation regressions, platform path edge cases, unexpected target directories
- Safe modification: Preserve path-validation helpers and add isolated route tests before large refactors
- Test coverage: No automated coverage found

## Scaling Limits

**Single-host local architecture:**
- Current capacity: One Node process per deployment with local SQLite and host filesystem dependencies
- Limit: Horizontal scaling is impractical because live sessions, PTYs, plugin subprocesses, and provider home-directory state are host-local
- Symptoms at limit: Lost live session affinity, duplicated watcher work, inconsistent local file/session visibility
- Scaling path: Introduce explicit multi-tenant/session coordination or keep deployment model single-host by design

## Dependencies at Risk

**Local CLI dependencies (`claude`, `codex`, `cursor`, `gemini`, `task-master`):**
- Risk: Upstream CLI behavior, output formats, or auth flows can change outside this repo
- Impact: Session execution, MCP management, and TaskMaster automation can break without code changes here
- Migration plan: Isolate adapters further and add smoke tests/contract tests around child-process interfaces

**`node-pty`:**
- Risk: Native dependency with platform/build sensitivity
- Impact: Shell functionality can fail during install or after Node upgrades
- Migration plan: Keep install workaround scripts current (`scripts/fix-node-pty.js`) and test on supported host environments before upgrades

## Missing Critical Features

**Automated regression suite:**
- Problem: Core flows have no automated safety net
- Current workaround: lint/typecheck/build + manual verification
- Blocks: Confident refactors across provider/session/shell code
- Implementation complexity: Medium; start with backend integration tests and a few UI smoke flows

## Test Coverage Gaps

**Provider bridges and live transport:**
- What's not tested: Claude/Codex/Cursor/Gemini message normalization, reconnect behavior, permission approval flow
- Risk: Real-time regressions are easy to ship unnoticed
- Priority: High
- Difficulty to test: Moderate because provider adapters need good fakes/mocks

**Project and filesystem operations:**
- What's not tested: project discovery, workspace creation, upload/path validation, GitHub clone/branch/PR helpers
- Risk: Can break onboarding and destructive file flows
- Priority: High
- Difficulty to test: Moderate to high because of home-directory and git/process dependencies

---
*Concerns audit: 2026-03-16*
*Update as issues are fixed or new ones discovered*
