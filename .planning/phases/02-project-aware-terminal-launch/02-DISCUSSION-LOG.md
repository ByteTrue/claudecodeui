# Phase 2: Project-Aware Terminal Launch - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-21
**Phase:** 02-project-aware-terminal-launch
**Areas discussed:** Project binding strategy, Project identity presentation, Launch and reconnect behavior, Header information density

---

## Project binding strategy

### Q1. Opening the terminal panel should bind to which project?

| Option | Description | Selected |
|--------|-------------|----------|
| Current selected project | Bind new terminal launches to the project currently selected in the workspace | ✓ |
| Last bound project | Reuse the last terminal-bound project until the user manually changes it | |
| Session-first fallback | Prefer the current session's project, otherwise use the selected project | |

**User's choice:** Current selected project
**Notes:** New integrated terminals should follow the current workspace selection by default.

### Q2. What happens if the user switches to another project while the terminal is open?

| Option | Description | Selected |
|--------|-------------|----------|
| Immediately switch context | Move the existing integrated terminal to the newly selected project | |
| Stay bound to original project | Keep the terminal attached to its original project and show that clearly in the UI | ✓ |
| Ask for confirmation | Prompt the user to choose whether to keep or switch terminal context | |

**User's choice:** Stay bound to original project
**Notes:** The terminal must not silently move command context when the workspace selection changes.

### Q3. How should the UI express a mismatch between terminal-bound project and currently viewed project?

| Option | Description | Selected |
|--------|-------------|----------|
| Show only the bound project | Display the bound project and do not call out the current viewed project | |
| Show both contexts clearly | Display the bound project and add a cue that the user is currently viewing another project | ✓ |
| Show only a path | Expose raw path information and let the user infer the difference | |

**User's choice:** Show both contexts clearly
**Notes:** The mismatch should be visible enough to avoid running commands in the wrong repository.

### Q4. What should happen if the user switches back to the original project?

| Option | Description | Selected |
|--------|-------------|----------|
| Restore existing live terminal | Reattach to the existing terminal state for that bound project | ✓ |
| Start a fresh terminal | Create a new shell instance when returning to that project | |
| Leave unchanged until manual reconnect | Do nothing automatically and wait for explicit user action | |

**User's choice:** Restore existing live terminal
**Notes:** Returning to the bound project should feel like coming back to the same working terminal, not opening a new one.

---

## Project identity presentation

### Q1. What should the panel title be?

| Option | Description | Selected |
|--------|-------------|----------|
| `Terminal` + project info in subtitle | Keep `Terminal` as the main title and place project identity in secondary text | ✓ |
| `Terminal · Project Name` | Combine terminal label and project name in one title line | |
| Project name as primary title | Make the project the dominant title and demote `Terminal` | |

**User's choice:** `Terminal` + project info in subtitle
**Notes:** The terminal remains the main surface identity; project belongs in supporting header text.

### Q2. What project identity should the subtitle show by default?

| Option | Description | Selected |
|--------|-------------|----------|
| Friendly project name only | Show only `displayName` | |
| Friendly project name + short path | Show `displayName` plus a short path for disambiguation | ✓ |
| Full absolute path | Show the full filesystem path directly | |

**User's choice:** Friendly project name + short path
**Notes:** The subtitle should be clear enough to distinguish similarly named projects without becoming visually noisy.

### Q3. How visible should a project mismatch warning be?

| Option | Description | Selected |
|--------|-------------|----------|
| Plain secondary text | Mention the mismatch in normal helper text only | |
| Light badge / pill | Surface the mismatch with a noticeable but lightweight badge treatment | ✓ |
| Full warning banner | Treat the mismatch as a prominent warning state | |

**User's choice:** Light badge / pill
**Notes:** The mismatch is important context, but not an error condition.

### Q4. When should project identity be emphasized?

| Option | Description | Selected |
|--------|-------------|----------|
| Always fixed and equally strong | Keep the same strong identity treatment all the time | |
| Always visible, stronger on mismatch | Show identity at all times and amplify it when viewed/bound projects differ | ✓ |
| Only on mismatch | Hide most identity information until there is a conflict | |

**User's choice:** Always visible, stronger on mismatch
**Notes:** The default terminal identity should remain visible, with extra emphasis only when it helps avoid mistakes.

---

## Launch and reconnect behavior

### Q1. How should the terminal start when the user opens the panel?

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-connect immediately | Open the panel and start the terminal without a second user action | ✓ |
| Manual start button | Require an explicit "Start terminal" click before connecting | |
| Remember previous preference | Support either auto or manual start based on prior user behavior | |

**User's choice:** Auto-connect immediately
**Notes:** The integrated terminal should feel ready to use as soon as it opens.

### Q2. What is the first recovery path when auto-connect fails?

| Option | Description | Selected |
|--------|-------------|----------|
| Clear error + retry | Show a visible failure message with an explicit retry action | ✓ |
| Silent empty panel | Leave the panel blank and expect the user to reopen or retry elsewhere | |
| Automatic retries first | Retry multiple times before exposing a recovery action | |

**User's choice:** Clear error + retry
**Notes:** Failure handling should be understandable and explicit in Phase 2.

### Q3. What should happen when the user reopens the panel and the shell is still alive?

| Option | Description | Selected |
|--------|-------------|----------|
| Restore and focus | Resume the active terminal and focus input immediately | ✓ |
| Show an explicit reconnect/resume prompt | Require a user decision to resume the session | |
| Restore without focus | Bring the terminal back visually but do not focus input | |

**User's choice:** Restore and focus
**Notes:** Reopening the panel should feel like returning to the same live terminal.

### Q4. Should the UI expose connection progress and success?

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, with lightweight status | Show short connecting/live feedback in the integrated UI | ✓ |
| No, just make the terminal usable | Avoid extra connection status if the shell works | |
| Only on slow connections | Show feedback only when startup latency becomes noticeable | |

**User's choice:** Yes, with lightweight status
**Notes:** The terminal should read as a live service, not a passive embedded region.

---

## Header information density

### Q1. Should the header show connection state?

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, lightweight state | Show a small state indicator such as connecting, live, or disconnected | ✓ |
| No, overlay only | Keep connection state out of the header and rely on overlays | |
| Only for abnormal states | Hide normal state and only show disconnected/failure conditions | |

**User's choice:** Yes, lightweight state
**Notes:** Live state should be visible without turning the header into a heavy control bar.

### Q2. When should the header mention viewed-project vs bound-project differences?

| Option | Description | Selected |
|--------|-------------|----------|
| Only when they differ | Surface the distinction only on mismatch | ✓ |
| Always show both projects | Persist both contexts in the header all the time | |
| Never show the difference | Only show the bound terminal project | |

**User's choice:** Only when they differ
**Notes:** The mismatch signal should appear when useful and disappear when it adds no value.

### Q3. What technical context belongs in the header for Phase 2?

| Option | Description | Selected |
|--------|-------------|----------|
| Short path, not live cwd | Show a short project path but do not add full shell-aware cwd tracking yet | ✓ |
| Project name only | Avoid any path display | |
| Full path or live cwd | Surface more technical path context directly in the header | |

**User's choice:** Short path, not live cwd
**Notes:** Project identity needs some filesystem context, but deeper cwd awareness is a later-phase concern.

### Q4. How minimal should the header action area stay in Phase 2?

| Option | Description | Selected |
|--------|-------------|----------|
| Hide only | Keep only the collapse/hide action in the persistent header | ✓ |
| Hide + Restart | Add a restart control to the permanent header | |
| Hide + Restart + Disconnect | Add all shell actions directly to the permanent header | |

**User's choice:** Hide only
**Notes:** Persistent shell controls should stay minimal; retry/recovery affordances belong in connection-state UI for this phase.

---

## the agent's Discretion

- Exact label wording for connection-state text and badge copy
- Exact truncation and formatting rules for short paths
- Exact visual treatment for mismatch pills and status indicators
- Exact placement and styling of retry UI within connection states

## Deferred Ideas

None — discussion stayed within phase scope.
