# Research: Stack for Integrated Terminal

**Date:** 2026-03-16
**Context:** Brownfield enhancement for `Claude Code UI`
**Scope:** Add a VS Code-like integrated project terminal to the existing React + Express + WebSocket + PTY application

## Recommendation Summary

The current stack is already the correct foundation for v1. Do **not** replace the terminal renderer, transport, or PTY backend. Reuse:

- `@xterm/xterm` for terminal rendering
- first-party xterm addons already in the repo (`@xterm/addon-fit`, `@xterm/addon-web-links`, `@xterm/addon-webgl`)
- `node-pty` for PTY-backed shell processes
- the existing `/shell` WebSocket transport in `server/index.js`

The main work is product integration and session modeling, not stack replacement.

## Reuse vs Add

### Reuse As-Is

| Capability | Current Repo State | Recommendation | Confidence |
|---|---|---|---|
| Terminal rendering | `@xterm/xterm` already used in `src/components/shell/hooks/useShellTerminal.ts` | Keep xterm.js as the terminal surface | High |
| Layout fitting | `FitAddon` already used and fitted on init/resize | Keep and standardize fit calls around panel resize/show/hide | High |
| PTY process execution | `node-pty` already used in `server/index.js` | Keep node-pty for local shell sessions | High |
| Terminal transport | Existing `/shell` WebSocket init/input/resize/output flow | Keep current WebSocket transport; extend message model instead of replacing it | High |
| Clickable links | `WebLinksAddon` already used in non-minimal shell mode | Keep and extend link/file handling as terminal becomes more central | High |
| GPU acceleration | `WebglAddon` already used with graceful fallback | Keep optional; do not make WebGL a hard requirement | High |

### Add or Extend

| Need | Recommendation | Why | Confidence |
|---|---|---|---|
| Multi-terminal tabs | Add a client-side terminal tab/session model and a matching server-side terminal session identifier | Current plain-shell flow does not distinguish multiple concurrent tabs in the same project | High |
| Panel integration | Add a bottom-panel host above current feature-specific shell views | User goal is integrated workspace terminal, not a dedicated shell page | High |
| Mobile presentation | Use a mobile-specific fullscreen/bottom-sheet presentation over the workspace rather than a shallow bottom strip | Soft keyboard and vertical space constraints make desktop panel semantics weak on phones | Medium |
| Session metadata | Track tab name, cwd label, created-at, active state, and reconnect key in UI state | Needed for VS Code-like tab switching and reconnect behavior | High |
| Safer shell init protocol | Extend `/shell` init payload with an explicit terminal tab/session key and optionally a display title | Prevent PTY collisions and enable stable reconnect behavior | High |

## Recommended v1 Stack

### Frontend

- Keep React 18 feature modules in `src/components/`
- Reuse `Shell`, `useShellRuntime`, `useShellConnection`, and `useShellTerminal`
- Add a workspace terminal host component near `src/components/main-content/view/MainContent.tsx`
- Add a local terminal tab state hook/store for:
  - create tab
  - activate tab
  - close tab
  - rename tab
  - persist panel open/closed state

### Backend

- Keep Express + `ws` + `node-pty`
- Extend the `/shell` init contract in `server/index.js`
- Keep PTY lifetime management in `ptySessionsMap`, but change the keying strategy so multiple plain terminals per project are distinct
- Keep project-path validation and safe session validation

### Interaction Model

- Desktop:
  - bottom panel
  - resizable height
  - tab strip with active terminal
  - create/close/switch actions in the panel header
- Mobile:
  - open terminal as a dedicated bottom sheet or fullscreen sheet
  - preserve the same tab model, but simplify controls
  - prioritize large touch targets, visible active tab, and stable output rendering while the mobile keyboard is open

## What Not To Use

### Do Not Replace xterm.js

The repo already ships xterm.js and first-party addons. Replacing it would add migration risk without solving the product problem.

### Do Not Replace WebSocket with a Higher-Level Realtime Stack

The current terminal flow is already a straightforward stream of init/input/resize/output events. Socket.io or a custom RPC layer would add protocol overhead and migration work for little v1 benefit.

### Do Not Introduce SSH or Remote Shell Infrastructure in v1

The user request is about natural in-app project terminal execution for the current local workspace model. Remote execution, container orchestration, or SSH multiplexing is a separate product track.

### Do Not Build a Desktop-Only Bottom Panel

Mobile support is a stated v1 requirement. The stack can stay the same, but the presentation contract must account for small screens and the on-screen keyboard from the start.

## Mobile Implications

- xterm.js can stay as the renderer, but layout/focus behavior must be managed explicitly when the panel opens, closes, or resizes
- hidden or zero-height containers must be refit after becoming visible
- keyboard-heavy shortcuts cannot be the only access path; tap-first controls are required
- the mobile version should reuse the same backend session model, not invent a second terminal backend

## Brownfield Fit

This repo already has most low-level terminal pieces:

- renderer and addons in `src/components/shell/hooks/useShellTerminal.ts`
- connection/runtime hooks in `src/components/shell/hooks/useShellConnection.ts` and `src/components/shell/hooks/useShellRuntime.ts`
- PTY session handling in `server/index.js`
- mobile navigation entry for shell in `src/components/app/MobileNav.tsx`

The stack decision is therefore conservative: keep the terminal technology, change the workspace integration model.

## Sources

- VS Code terminal getting started: https://code.visualstudio.com/docs/terminal/getting-started
- VS Code shell integration: https://code.visualstudio.com/docs/terminal/shell-integration
- VS Code panel UX guidelines: https://code.visualstudio.com/api/ux-guidelines/panel
- xterm.js addons guide: https://xtermjs.org/docs/guides/using-addons/
- xterm.js Terminal API: https://xtermjs.org/docs/api/terminal/classes/terminal/
- xterm.js security guide: https://xtermjs.org/docs/guides/security/
- node-pty README: https://github.com/microsoft/node-pty

---
*Recommendation status: reuse existing terminal stack, extend session and layout layers*
