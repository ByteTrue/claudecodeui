# Claude Code UI

## What This Is

Claude Code UI is a browser-based workspace for AI-assisted coding that combines chat, file browsing, code editing, git workflows, and project-aware tooling in a single interface. It is used by people working inside project workspaces who want to stay in the app instead of jumping between separate tools. The current focus is to make terminal usage feel like a natural part of that workspace, especially for project-based command execution on desktop and mobile.

## Core Value

Users should be able to do their normal project work inside the app without breaking flow or leaving to a separate terminal window.

## Requirements

### Validated

- ✓ Users can open and work inside project-aware workspaces with file browsing and editing — existing
- ✓ Users can use integrated AI provider workflows for project work inside the app — existing
- ✓ Users can inspect and act on git state from inside the app — existing
- ✓ The codebase already has PTY-backed shell infrastructure and terminal UI building blocks — existing

### Active

- [ ] Add a VS Code-like terminal experience that feels naturally integrated into the current workspace UI
- [ ] Let users run commands directly from the current project/workspace context without leaving the app
- [ ] Support multiple terminal sessions with tab-based switching in v1
- [ ] Make the terminal usable on mobile for core actions: open, run commands, view output, and switch sessions

### Out of Scope

- Split-pane terminal layouts — defer until the integrated single-panel workflow is proven
- Advanced remote session persistence and recovery — defer until baseline in-app terminal flow is stable
- Deep chat/agent-to-terminal automation — not part of the first terminal usability milestone

## Context

This is a brownfield enhancement to an existing product rather than a new product initialization from scratch. The current application already includes a React/Vite frontend, a Node/Express backend, WebSocket transport, and PTY-backed shell plumbing. The gap is product experience, not basic terminal transport: the app does not yet offer a direct, natural, VS Code-like terminal flow embedded into the main project workflow.

The desired experience is:
- terminal lives in a bottom panel
- it opens in the current project/workspace directory by default
- users can create and switch between multiple terminal tabs
- the interaction should feel natural inside the existing app instead of bolted on
- mobile must be considered in the first version, not patched in later

The main pain point is context switching. Users currently need to leave the app and use the system terminal for common project commands, which breaks flow and weakens the value of having chat, files, editing, and git in one workspace.

## Constraints

- **Product Fit**: The terminal must feel native to the current UI — this is an integration milestone, not a standalone terminal product
- **Mobile**: Mobile must support the core terminal workflow — the feature cannot be desktop-only
- **Brownfield**: Existing shell, workspace, and navigation patterns should be reused where practical — large architectural rewrites are not justified for v1
- **Scope**: v1 must prioritize project command execution and tabbed sessions — feature creep into advanced terminal management should be deferred

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Use a bottom-panel terminal model similar to VS Code | Matches the user's expected mental model and fits naturally into a workspace UI | — Pending |
| Default terminal context to the current project/workspace directory | Removes manual directory switching and solves the main workflow pain point | — Pending |
| Include multi-session tab switching in v1 | A single terminal is not enough for the user's definition of usable | — Pending |
| Treat mobile usability as a first-version requirement | Mobile support was explicitly called out and affects layout decisions early | — Pending |

---
*Last updated: 2026-03-16 after initialization*
