# Research: Architecture for Integrated Project Terminal

**Date:** 2026-03-16  
**Scope:** Add a VS Code-like integrated terminal to the existing app by extending current shell infrastructure rather than replacing it.

## Architectural Direction

Build the feature as a workspace-level terminal panel layered on top of the current shell stack.

Do not build:

- a second terminal backend
- a separate terminal-only route as the primary experience
- a full terminal-layout system before tabbed sessions are working
- split panes in v1
- advanced chat/agent-to-terminal automation in v1

## Reuse First

### Existing Frontend Building Blocks

- `src/components/shell/view/Shell.tsx`
- `src/components/shell/hooks/useShellRuntime.ts`
- `src/components/shell/hooks/useShellConnection.ts`
- `src/components/standalone-shell/view/StandaloneShell.tsx`
- `src/components/main-content/view/MainContent.tsx`

### Existing Backend Building Blocks

- `/shell` WebSocket entry in `server/index.js`
- PTY session map and reconnect timeout handling in `server/index.js`
- `projectPath`, `sessionId`, `hasSession`, `initialCommand`, `cols`, `rows` shell init payload in `src/components/shell/hooks/useShellConnection.ts`

The main missing layer is a workspace terminal manager that can own multiple shell instances and embed them into the current layout.

## Proposed Component Boundaries

### 1. Terminal Panel Host

New responsibility:

- render the bottom-panel container
- handle expand/collapse
- own tab strip and high-level terminal controls
- manage desktop vs mobile presentation differences

Likely placement:

- near `src/components/main-content/view/MainContent.tsx`
- potentially a dedicated `workspace-terminal` feature module for panel state + view components

### 2. Terminal Tab State Manager

New responsibility:

- create/delete/switch terminal tabs
- store tab metadata
- map UI tabs to live shell instances
- keep inactive tabs alive without showing them

Recommended state:

- selected terminal tab id
- ordered tab list
- per-tab project binding
- connection state
- cwd/title metadata

This can start as React state/context local to main content and only move broader if other features need terminal launching later.

### 3. Shell Instance Wrapper

Reuse `Shell` / `StandaloneShell` as the per-tab terminal surface, but make each instance operate under a stable tab identity.

Needs:

- support for mounting as one tab among many
- clean inactive/active focus handling
- no forced disconnect on simple panel/tab switches

### 4. Backend Session Registry Extensions

Server-side work should remain in the current `/shell` pathway, but it needs clearer semantics for UI tabs:

- distinguish tab identity from provider session resume identity
- allow plain project terminals to coexist cleanly
- keep reconnect behavior predictable when the panel hides/shows
- preserve cwd and state metadata if needed for reconnect UI

## Data Flow

### Open New Terminal

1. User opens terminal panel from the workspace
2. UI creates a terminal-tab record bound to the current project
3. New tab defaults its cwd to the selected project's root/workspace path
4. Shell instance mounts and opens `/shell`
5. Init payload includes current project path and terminal dimensions
6. Server creates or reconnects PTY session
7. Output streams into that tab only

### Switch Tabs

1. User selects another terminal tab
2. UI marks previous tab inactive but does not destroy it
3. Selected shell instance receives focus and refit
4. No backend restart should happen just because the visible tab changed

### Change Projects

1. User selects a different project/workspace
2. UI decides whether to keep terminal tabs project-scoped or reset to the new project scope
3. New terminals default to the new project root
4. Existing tabs from the old project should remain clearly labeled or be intentionally cleared; implicit cross-project reuse is risky

### Mobile Interaction

1. Terminal panel opens as a bottom sheet / bottom panel variant
2. Focus triggers fit/viewport recalculation
3. Tab switching remains available with larger controls
4. Terminal chrome collapses while typing to prioritize output + input
5. Core v1 bar on mobile is open/run/read/switch, not desktop feature parity

## Build Order

### Phase A: Product Integration Layer

- add bottom-panel UI
- integrate panel into current main workspace
- define tab state and creation/switch/close actions

### Phase B: Session Semantics

- map tabs to stable shell instances
- ensure inactive tabs do not get torn down unnecessarily
- clarify reconnect/timeout behavior for the new panel lifecycle

### Phase C: Mobile and UX Hardening

- adapt panel behavior for mobile
- improve fit/focus/keyboard behavior
- harden status, reconnect, and exit feedback

### Phase D: Follow-on Enhancements

- contextual launch points
- better tab labels/cwd awareness
- richer shell integration

## Key Decisions Suggested By The Research

| Decision | Recommendation | Why |
|----------|----------------|-----|
| Terminal placement | Bottom panel | Matches requested UX and preserves current workspace context |
| Shell engine | Reuse existing xterm.js shell | Current stack already supports it |
| Backend transport | Reuse `/shell` WebSocket | Streaming model already exists |
| Session model | UI-managed tab records over PTY sessions | Keeps product UX separate from provider session semantics |
| Mobile approach | Same engine, different surrounding UX | Avoids duplicate implementations |

## Architectural Risks

- Current shell feature is mounted as a whole-page tab; bottom-panel integration will change lifecycle assumptions
- Existing disconnect behavior may be too aggressive when tabs/panel visibility change
- PTY timeout/reconnect behavior in `server/index.js` needs review once tabs can exist in the background
- Rendering multiple hidden xterm instances can become expensive if not managed carefully

## Sources

- VS Code terminal basics: https://code.visualstudio.com/docs/terminal/getting-started
- VS Code shell integration: https://code.visualstudio.com/docs/terminal/shell-integration
- xterm.js addons guide: https://xtermjs.org/docs/guides/using-addons/
- xterm.js flow control guide: https://xtermjs.org/docs/guides/flowcontrol/
- node-pty README: https://github.com/microsoft/node-pty
