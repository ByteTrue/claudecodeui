# Research: Features for Integrated Project Terminal

**Date:** 2026-03-16  
**Scope:** Identify which terminal capabilities are expected in v1 for a VS Code-like integrated terminal inside this app.

## Summary

For this milestone, users are not asking for a new terminal product. They are asking for the existing app to stop forcing them out to a system terminal for normal project commands. That makes the real v1 target:

- obvious access from the workspace
- default project cwd
- multiple terminal tabs
- stable output and reconnect behavior
- mobile core usability

## Table Stakes

These are the features most likely to feel mandatory for a “VS Code-like” terminal experience.

### Terminal Access In Context

- Bottom-panel terminal that feels attached to the current workspace
- Easy open/close without leaving the current project flow
- Resize support so users can temporarily expand terminal height

Complexity: Medium  
Dependencies: main layout integration, shell mount lifecycle

### Project-Aware Default Context

- New terminal starts in the current project/workspace root
- Terminal remains clearly associated with the selected project
- Switching projects creates or scopes terminals appropriately

Complexity: Medium  
Dependencies: project selection state, shell init payload, tab/session model

### Multiple Terminal Tabs

- Create multiple terminal sessions
- Switch between tabs quickly
- Close/restart individual tabs
- Show simple status such as running, disconnected, or exited

Complexity: Medium-High  
Dependencies: frontend terminal manager, backend session identity, tab metadata

### Stable Core Terminal Behavior

- Real-time output
- Input handling
- Resize handling
- Copy/paste
- Link interaction for URLs and file-like output where feasible

Complexity: Medium  
Dependencies: existing xterm.js and `/shell` transport

### Mobile Core Usability

- Open the terminal comfortably on small screens
- Type commands without the UI fighting the soft keyboard
- Read output without cramped chrome
- Switch between tabs with touch-friendly controls

Complexity: Medium-High  
Dependencies: responsive panel layout, viewport/keyboard handling, simplified controls

## Strong v1 Candidates

These are not as universally mandatory as the table stakes above, but they strongly improve perceived quality.

### Terminal State Preservation During Normal Navigation

- Keep inactive terminal tabs alive while users switch between app views
- Avoid destroying output just because a user visits files/chat and returns

Complexity: Medium  
Dependencies: component lifecycle control, session persistence rules

### Better Tab Labels

- Show terminal name based on shell, cwd, or foreground intent
- Surface exit/failure state in the tab

Complexity: Low-Medium  
Dependencies: session metadata, UI tab model

### Connection / Recovery Feedback

- Clear state when a terminal is connecting, disconnected, or reconnecting
- User-visible reconnect path rather than silent failures

Complexity: Low-Medium  
Dependencies: current shell connection events

## Differentiators

These are useful later, but not required for this milestone to feel successful.

### Shell Integration Features

- command boundary detection
- cwd tracking beyond initial workspace root
- command decorations / run history
- richer file-link resolution

Complexity: High  
Dependencies: shell integration scripts or escape-sequence handling

### Contextual Launch Points

- “Open in Terminal Here” from file tree
- run selected command/snippet from editor
- send commands from chat/agent workflows with user confirmation

Complexity: Medium  
Dependencies: command routing, file tree/editor integration

### Session Persistence Across Reloads

- restore terminal tabs after full page reload
- reconnect to long-lived PTY sessions

Complexity: High  
Dependencies: persistent tab metadata, reconnect semantics, timeout policy

### Split Terminals

- side-by-side terminal panes
- drag/drop tab groups

Complexity: High  
Dependencies: layout engine, focus management, resize coordination

## Anti-Features For This Milestone

These are the wrong things to prioritize now.

| Anti-Feature | Why It Should Wait |
|--------------|--------------------|
| Split terminal panes | Adds layout complexity before the single-panel workflow is proven |
| Shell profile manager and advanced preferences | Not required to solve the main user pain |
| Full desktop shortcut parity on mobile | Mobile should be core-usable, not desktop-identical |
| Hidden agent automation that runs commands automatically | Safety and clarity matter more than cleverness in v1 |
| Deep shell-integration scripting before tabs/layout are solid | Useful later, but not the blocker today |

## Mobile-Specific Expectations

Users will tolerate reduced density on mobile. They will not tolerate basic actions being awkward.

Mobile v1 should make these actions easy:

- open terminal
- focus input
- read recent output
- switch tabs
- close a tab
- return to the rest of the workspace

Mobile v1 does not need:

- split panes
- dense toolbar controls
- desktop-style keyboard shortcut coverage
- power-user decoration features

## Recommended v1 Boundary

Include in v1:

- bottom-panel workspace terminal
- project-root default cwd
- multiple tabs
- stable tab switching
- resize/expand behavior
- reconnect/status UX
- mobile core usability

Defer from v1:

- split panes
- advanced shell integration
- reload persistence
- deep file-tree/chat/editor launch actions

## Sources

- VS Code terminal basics: https://code.visualstudio.com/docs/terminal/getting-started
- VS Code terminal appearance and tabs: https://code.visualstudio.com/docs/terminal/appearance
- VS Code shell integration: https://code.visualstudio.com/docs/terminal/shell-integration
