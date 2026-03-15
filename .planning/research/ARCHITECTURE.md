# Research: Architecture for Integrated Terminal

**Date:** 2026-03-16
**Context:** Add a VS Code-like project terminal to an existing React + Express + WebSocket + PTY workspace app

## Architectural Direction

Extend the existing shell stack instead of replacing it.

The current codebase already has:

- a reusable terminal renderer in `src/components/shell/view/Shell.tsx`
- runtime and transport hooks in `src/components/shell/hooks/useShellRuntime.ts`, `useShellConnection.ts`, and `useShellTerminal.ts`
- a terminal wrapper in `src/components/standalone-shell/view/StandaloneShell.tsx`
- a `/shell` WebSocket endpoint and PTY lifecycle manager in `server/index.js`

The missing layer is a **workspace-integrated terminal orchestration layer**:

- panel/sheet host
- terminal tab/session state
- session identity that supports multiple concurrent plain terminals per project
- mobile-aware presentation

## Key Architectural Constraint From Current Code

The current plain-shell session keying is not sufficient for multiple tabs. In `server/index.js`, plain shells without an explicit command or session currently collapse to:

- `projectPath`
- `sessionId || 'default'`
- optional command hash only when an initial command exists

That means multiple plain terminals in the same project can collide onto the same PTY session unless the protocol is extended. This is the highest-priority backend change.

## Proposed Component Boundaries

### 1. Terminal Workspace Host

**Responsibility**
- Own whether the integrated terminal is open
- Choose desktop bottom-panel vs mobile sheet/fullscreen presentation
- Render the tab strip and active terminal view

**Suggested location**
- Near `src/components/main-content/view/MainContent.tsx`

**Why here**
- The terminal must support the current workspace, not replace the current tab
- `MainContent` already knows `selectedProject`, `selectedSession`, `activeTab`, and `isMobile`

### 2. Terminal Tabs State

**Responsibility**
- Create terminal tabs
- Track active tab
- Track per-tab metadata:
  - `tabId`
  - `projectPath`
  - `title`
  - `mode`
  - `createdAt`
  - `status`

**Suggested implementation**
- Feature-local hook or context, for example `useIntegratedTerminalState`

**Why**
- The current `Shell` component manages one terminal runtime instance
- The new product need is session orchestration, not new terminal rendering logic

### 3. Terminal Session View

**Responsibility**
- Render a single terminal tab
- Reuse existing `Shell` or a refactored shell view as the per-tab terminal surface

**Suggested strategy**
- Keep `Shell` as the low-level terminal surface
- Add a new wrapper for integrated tabs rather than forcing `StandaloneShell` to absorb panel-state concerns

### 4. Shell Transport Contract

**Responsibility**
- Carry an explicit tab/session identity from client to server
- Preserve current init/input/resize/output flow

**Required protocol extension**
- Add a distinct client-generated terminal tab/session key to the `init` message

**Why**
- Prevent multiple terminals in the same workspace from reconnecting to the same PTY accidentally

### 5. PTY Session Manager

**Responsibility**
- Map `terminalTabId` or equivalent to a PTY session
- Keep the existing timeout/reconnect model
- Clean up on explicit close or idle timeout

**Suggested location**
- Keep in `server/index.js` for v1 if change scope is small
- Optionally extract later if session lifecycle becomes more complex

## Proposed Data Flow

### Open Terminal

1. User opens the terminal panel from the workspace UI
2. Host creates or activates a terminal tab for the current project
3. Active tab mounts a shell surface using the current project path
4. `Shell` initializes xterm and opens `/shell`
5. Client sends `init` with:
   - `projectPath`
   - `terminalTabId`
   - `cols`
   - `rows`
   - any optional title/mode metadata
6. Server resolves/reuses or creates a PTY session for that explicit tab identity
7. Output streams back over WebSocket and is rendered by xterm

### Switch Tabs

1. User selects another tab in the terminal strip
2. Host marks the new tab active
3. Inactive tabs should either:
   - remain mounted but hidden, or
   - disconnect and reconnect by stable tab identity on activation

**Preferred v1 approach**
- Keep only the active terminal live in the DOM, but make reconnect deterministic through a stable tab identity

**Why**
- Hidden xterm instances are awkward to size correctly
- Current server-side PTY buffering and timeout already support reconnect-oriented behavior

### Close Tab

1. User closes a terminal tab
2. Client sends explicit close/disconnect intent or closes the socket
3. Server either:
   - terminates the PTY immediately for explicit close, or
   - keeps reconnect timeout behavior only for unexpected disconnects

This explicit-close distinction is a recommended extension; it is an inference from current behavior, not stated in the official docs.

## Session Lifecycle Recommendations

### Create

- Generate a stable `terminalTabId` on the client
- Bind the tab to the current project path at creation time
- Default title from:
  - workspace name
  - shell type
  - or xterm `onTitleChange` updates

### Activate

- When a tab becomes visible:
  - ensure the terminal container is measurable
  - refit xterm
  - send resize after fit
  - focus terminal only after layout settles

This aligns with xterm's `FitAddon` usage and resize/event API.

### Suspend / Background

- Keep PTY alive on the server for a timeout window
- Allow the UI to reconnect by tab identity
- Do not depend on React component continuity alone for session survival

### Destroy

- Explicit tab close should cleanly dispose UI state and terminate the PTY session tied to that tab

## Mobile Layout Adaptation

### Desktop

- Terminal lives in a bottom panel
- Panel is resizable
- Tab strip sits in the panel header
- Main workspace remains visible above it

### Mobile

- Reuse the same tab/session model
- Present terminal as a bottom sheet or fullscreen sheet instead of a shallow bottom panel
- Keep tab controls large and horizontally scrollable if needed
- Refit terminal on:
  - sheet open
  - orientation change
  - soft keyboard open/close

Why this is the recommended adaptation:

- VS Code's panel guidance favors supporting functionality in a resizable panel
- phones do not have enough stable vertical space for a desktop-like panel
- the repo already distinguishes mobile UI behavior in `src/components/app/MobileNav.tsx`

## Suggested Build Order

1. Extend shell session identity in backend protocol
2. Introduce terminal tabs state in the frontend
3. Add desktop bottom-panel host integrated with workspace content
4. Reuse `Shell` as the active tab renderer
5. Add explicit close/reconnect semantics
6. Add mobile presentation with fit/focus/keyboard handling
7. Add polish like rename, cwd label, and output link integration

## Reuse Opportunities

### Reuse Directly

- `src/components/shell/view/Shell.tsx`
- `src/components/shell/hooks/useShellRuntime.ts`
- `src/components/shell/hooks/useShellConnection.ts`
- `src/components/shell/hooks/useShellTerminal.ts`
- `server/index.js` `/shell` WebSocket handling and PTY buffering

### Refactor Carefully

- `src/components/main-content/view/MainContent.tsx`
  - shell is currently a full-tab experience under `activeTab === 'shell'`
  - integrated terminal likely belongs alongside, not inside, the tab switch model

- `src/components/standalone-shell/view/StandaloneShell.tsx`
  - keep for modal/minimal command flows
  - do not force it to own multi-tab workspace integration concerns

## Sources

- VS Code terminal getting started: https://code.visualstudio.com/docs/terminal/getting-started
- VS Code shell integration: https://code.visualstudio.com/docs/terminal/shell-integration
- VS Code panel UX guidelines: https://code.visualstudio.com/api/ux-guidelines/panel
- xterm.js addons guide: https://xtermjs.org/docs/guides/using-addons/
- xterm.js Terminal API: https://xtermjs.org/docs/api/terminal/classes/terminal/
- node-pty README: https://github.com/microsoft/node-pty

---
*Architecture recommendation status: extend current shell stack with a new terminal orchestration layer and explicit multi-tab session identity*
