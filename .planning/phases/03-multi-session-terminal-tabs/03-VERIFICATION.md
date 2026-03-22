---
phase: 03-multi-session-terminal-tabs
verified: 2026-03-22T17:29:24Z
status: passed
score: 5/5 must-haves verified
human_verification:
  - test: "Create a second and third integrated terminal tab for the same project from the bottom panel"
    expected: "Each tab gets a distinct title (`project`, `project · 2`, `project · 3`) and connects to a distinct PTY identity instead of silently reusing the first tab."
    why_human: "Distinct PTY reuse vs fresh spawn depends on live shell transport behavior and cannot be proven by static types."
  - test: "Switch between existing tabs, then close the active middle tab"
    expected: "Switching tabs reconnects to the correct existing PTY, inactive tabs keep their own status chip, and closing the active middle tab selects the left neighbor."
    why_human: "The active-shell remount key and left-neighbor close rule are only meaningful through live UI interaction."
  - test: "Restart one tab while another remains open, then hide and reopen the panel"
    expected: "Only the restarted tab gets a fresh PTY, the untouched tab stays live, and hide/reopen restores the same tab inventory and active selection."
    why_human: "Restart and panel continuity cross the browser, websocket, and PTY cache boundary."
  - test: "Trigger a real process exit on the active tab and spot-check mobile viewport rendering"
    expected: "The active tab shows `Exited`, the other tab remains `Live`, and the mobile viewport still exposes tab controls, terminal input, and workspace navigation affordances."
    why_human: "Exit-state UI and touch-sized layout behavior require a real runtime surface."
---

# Phase 3: Multi-Session Terminal Tabs Verification Report

**Phase Goal:** Users can work with multiple terminal sessions in parallel from a single integrated panel.
**Verified:** 2026-03-22T17:29:24Z
**Status:** passed
**Re-verification:** Yes - browser-assisted runtime UAT on 2026-03-23

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | The integrated panel can create multiple tabs for the same project without collapsing them into one shared UI record. | ✓ VERIFIED | Browser UAT created `@siteboon/claude-code-ui`, `@siteboon/claude-code-ui · 2`, and `@siteboon/claude-code-ui · 3`, and the panel preserved a separate close button plus stored status chip for each tab. |
| 2 | Switching tabs reconnects to the correct existing PTY instead of restarting inactive tabs. | ✓ VERIFIED | After creating multiple tabs, switching back to the first tab changed the active restart affordance to the first tab and the server logged `Reconnecting to existing PTY session` for the earlier tab key instead of spawning a fresh shell. |
| 3 | Closing the active middle tab keeps the panel open and selects the left neighbor when one exists. | ✓ VERIFIED | With three tabs open, closing active `· 2` left the panel open with tabs `project` and `project · 3`, and the restart affordance moved to the first tab, confirming left-neighbor selection. |
| 4 | Restart is truly tab-scoped: only the chosen tab gets a fresh PTY, while other tabs keep their prior state. | ✓ VERIFIED | Restarting active `project · 3` triggered server-side cleanup for that tab's PTY key and a fresh spawn, while the untouched `project` tab remained `Live` in the strip. |
| 5 | Per-tab lifecycle state is visible and remains scoped to the matching tab, including a real `Exited` transition. | ✓ VERIFIED | The UI showed `Live` on both open tabs during normal operation, and after killing the active tab's shell process the active tab changed to `Exited` while the inactive tab stayed `Live`. |

**Score:** 5/5 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
| --- | --- | --- | --- |
| `src/types/app.ts` | Tab-based integrated terminal state with persisted lifecycle fields | ✓ VERIFIED | Defines `TerminalTabStatus`, `IntegratedTerminalTab`, and `TerminalPanelState.tabs` plus `activeTabId`. |
| `src/hooks/useProjectsState.ts` | Deterministic tab helpers for create/select/close/restart/status update | ✓ VERIFIED | Builds tab records, increments `restartNonce`, preserves inactive tabs, and applies the left-neighbor close rule. |
| `src/components/main-content/view/MainContent.tsx` | Active-tab resolution from `terminalPanelState.tabs` and `activeTabId` | ✓ VERIFIED | Resolves `activeTerminalTab` once and derives bound project/session from that tab's binding. |
| `src/components/shell/view/IntegratedTerminalPanel.tsx` | Tab strip UI and visible shell keyed by active tab id | ✓ VERIFIED | Renders the tab strip, wires create/select/close/restart controls, renders inactive chips from stored state, and mounts the visible shell with `key=terminal-shell-${activeTab.id}`. |
| `src/components/shell/hooks/useShellConnection.ts` and `src/components/shell/hooks/useShellRuntime.ts` | Tab-aware runtime init with restart intent | ✓ VERIFIED | Send `terminalTabId` and `forceFresh`, and track runtime identity from tab id plus restart nonce. |
| `src/components/shell/view/Shell.tsx` and `src/components/standalone-shell/view/StandaloneShell.tsx` | Runtime status and exit-code propagation | ✓ VERIFIED | Feed `terminalTabId`, `restartNonce`, `phase`, `canRetry`, and `exitCode` back into the integrated panel. |
| `server/index.js` | Tab-aware PTY cache key, reconnect, disconnect retention, and process exit reporting | ✓ VERIFIED | Uses `projectPath + sessionId + terminalTabId` as PTY identity, emits lifecycle messages, and preserves inactive PTYs across WebSocket disconnect. |

### Key Link Verification

| From | To | Via | Status | Details |
| --- | --- | --- | --- | --- |
| `useProjectsState.ts` | `TerminalPanelState.tabs` | `createTerminalTab`, `setActiveTerminalTab`, `closeTerminalTab`, `restartTerminalTab`, `updateTerminalTabStatus` | WIRED | The integrated panel never owns a second source of truth for tab state. |
| `MainContent.tsx` | `IntegratedTerminalPanel.tsx` | `terminalTabs`, `activeTerminalTabId`, bound project/session props, and tab callbacks | WIRED | The panel consumes active-tab-derived identity instead of ambient workspace selection. |
| `IntegratedTerminalPanel.tsx` | `StandaloneShell.tsx` and `Shell.tsx` | `terminalTabId`, `restartNonce`, and keyed visible-shell mount | WIRED | Tab switches reconnect by `activeTab.id`, while same-tab restart uses `restartNonce` inside the mounted shell. |
| `Shell.tsx` and `useShellConnection.ts` | `server/index.js` | `init`, `status`, and `process_exit` messages | WIRED | The client sends tab-aware init payloads and consumes lifecycle messages emitted by the server. |
| `server/index.js` | persisted tab status | tab-aware PTY reuse and lifecycle events | WIRED | Live reconnect, disconnect retention, force-fresh restart, and process exit all feed back into the stored tab status model. |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| --- | --- | --- | --- | --- |
| `SESS-01` | `03-01-PLAN.md` | User can create a new terminal tab from the integrated terminal panel | ✓ SATISFIED | Runtime UAT created second and third tabs from the `New tab` button, and the UI named them `project · 2` and `project · 3`. |
| `SESS-02` | `03-03-PLAN.md` | User can switch between multiple terminal tabs without restarting other active tabs | ✓ SATISFIED | Switching back to the first tab caused a reconnect to the existing PTY session instead of a fresh spawn, and the inactive tab kept its `Live` chip. |
| `SESS-03` | `03-01-PLAN.md` and `03-03-PLAN.md` | User can close an individual terminal tab | ✓ SATISFIED | Closing active `project · 2` removed only that tab, kept the panel open, and selected the left neighbor. |
| `SESS-04` | `03-01-PLAN.md` and `03-02-PLAN.md` | User can restart an individual terminal session from the UI | ✓ SATISFIED | Restarting active `project · 3` cleaned up only that tab's PTY key and spawned a fresh shell without disturbing the other tab. |
| `SESS-05` | `03-01-PLAN.md`, `03-02-PLAN.md`, and `03-03-PLAN.md` | User can see each terminal tab's state such as connecting, running, disconnected, or exited | ✓ SATISFIED | The panel rendered `Live` and `Exited` chips during runtime UAT; the shell transport emits `connecting`, `live`, `disconnected`, and `process_exit`, and the integrated panel maps runtime `loading` to persisted `connecting` before updating tab state. |

Phase 3 plan frontmatter declares exactly `SESS-01` through `SESS-05`, and `REQUIREMENTS.md` maps those ids to Phase 3. No orphaned Phase 3 requirement ids were found.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| --- | --- | --- | --- | --- |
| None | - | No placeholder tab state, TODO stubs, or fake lifecycle chips remained in the phase-touched files after review. | Info | Runtime behavior is backed by real transport events and persisted tab records. |

### Runtime Gap Closure

Browser-assisted UAT surfaced two environment-specific gaps that were handled during verification, not as code regressions. First, platform mode initially rendered a blank app because no database user existed; verification created the first user and completed onboarding so runtime testing could proceed. Second, the provider-backed terminal made `agent-browser` keyboard focus unreliable for xterm input, so the final UAT anchored its evidence on tab-strip interaction, screenshots, and `/shell` server logs rather than raw terminal typing alone.

### Runtime UAT Completed

### 1. Distinct Tab Creation

**Result:** Passed
**Evidence:** From the integrated panel, `New tab` created `@siteboon/claude-code-ui · 2` and then `· 3`. On the server, the first tab disconnected into keepalive and the next tab triggered a fresh `/shell init` plus a new PTY spawn instead of reusing the first tab blindly.

### 2. Switch Without Restart

**Result:** Passed
**Evidence:** Switching from `· 2` back to the first tab changed the active restart affordance to `Restart @siteboon/claude-code-ui`, kept the inactive `· 2 Live` chip visible, and produced `Reconnecting to existing PTY session` for the first tab's cached PTY key on the server.

### 3. Close Active Middle Tab

**Result:** Passed
**Evidence:** With three tabs open, activating `· 2` and closing it left `@siteboon/claude-code-ui` and `@siteboon/claude-code-ui · 3` in place. The active restart affordance targeted the first tab immediately after close, which matched the left-neighbor selection rule.

### 4. Restart One Tab Only

**Result:** Passed
**Evidence:** Restarting active `@siteboon/claude-code-ui · 3` triggered server-side cleanup for that tab's PTY key, spawned a fresh shell process, and left the other tab visibly `Live`. The panel then hid and reopened without losing the same two-tab inventory.

### 5. Exit State And Mobile Spot-Check

**Result:** Passed
**Evidence:** Killing the newest `claude` child process under the dev server produced `Shell process exited with code: 143` in server logs and changed only `@siteboon/claude-code-ui · 3` to `Exited` while `@siteboon/claude-code-ui` stayed `Live`. A follow-up `iPhone 14` snapshot still showed the tab strip, terminal input, and Chat/Shell/Files/Git controls, which confirms the Phase 3 tab UI did not regress mobile core access ahead of Phase 4.

### Evidence References

- `/tmp/phase3-tab-switch-a.png`
- `/tmp/phase3-three-tabs.png`
- `/tmp/phase3-middle-active.png`
- `/tmp/phase3-close-middle.png`
- `/tmp/phase3-after-restart.png`
- `/tmp/phase3-hidden.png`
- `/tmp/phase3-reopened.png`
- `/tmp/phase3-after-kill.png`
- `/tmp/phase3-mobile.png`

### Gaps Summary

No remaining Phase 3 code or runtime gaps were found after browser-assisted UAT. Multi-tab creation, tab-to-PTY continuity, close/reopen rules, tab-scoped restart, and visible per-tab lifecycle status all passed. Mobile keyboard and major-view continuity remain correctly deferred to Phase 4, and disconnect/recovery UX polish remains Phase 5 scope.

---

_Verified: 2026-03-22T17:29:24Z_
_Verifier: Codex_
