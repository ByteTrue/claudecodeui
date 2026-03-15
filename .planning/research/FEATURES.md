# Research: Features for Integrated Terminal

**Date:** 2026-03-16
**Context:** Integrated, VS Code-like project terminal inside an existing coding workspace

## Key Finding

For this milestone, users do not need a novel terminal product. They need the app to stop forcing a context switch to the system terminal. That makes the v1 bar mostly about **table stakes**:

- easy open/close
- correct project cwd
- multiple tabs
- stable output/input
- usable mobile presentation

## Table Stakes

### Terminal Panel Presence

| Feature | Why it is table stakes | Complexity | Dependencies |
|---|---|---|---|
| Bottom-panel terminal entry point | Matches common editor expectations and the user explicitly asked for VS Code-like integration | Medium | Main layout integration |
| Open/close terminal without leaving current work area | Users expect terminal to support their current task, not replace it | Medium | Panel state |
| Remember whether the panel is open | Prevents friction in repeated command workflows | Low | Local UI preferences |

### Project Context

| Feature | Why it is table stakes | Complexity | Dependencies |
|---|---|---|---|
| Terminal opens in current project/workspace directory | This is the core pain point being solved | Medium | Selected project wiring + shell init payload |
| Clear project/cwd labeling in the tab or header | Users need confidence they are running commands in the right place | Low | Session metadata |
| Preserve project context when creating a new tab | Users should not manually `cd` after every new terminal | Medium | Tab creation flow |

### Multi-Session Terminal Use

| Feature | Why it is table stakes | Complexity | Dependencies |
|---|---|---|---|
| Create multiple terminal tabs | Explicit v1 requirement from the user | High | Distinct session keys on server and client |
| Switch active terminal quickly | Multi-session is not useful without fast switching | Medium | Tab strip state |
| Close terminal tabs cleanly | Basic lifecycle expectation | Medium | PTY cleanup / disconnect behavior |
| Rename terminal tabs or show useful auto titles | Helps users distinguish long-lived sessions | Medium | Tab metadata or xterm title events |

### Terminal Core UX

| Feature | Why it is table stakes | Complexity | Dependencies |
|---|---|---|---|
| Real-time output and input | Core terminal behavior | Already present | Existing shell transport |
| Resize handling | Necessary in panel-based layouts | Already present but needs stronger visibility handling | xterm fit + panel visibility hooks |
| Clickable links / file references where possible | Modern integrated terminal expectation | Medium | Existing web-links plus app-specific activation |
| Stable reconnect behavior while the app UI changes | Users should not lose a running command because they switched views | High | Session keying + mount lifecycle |

### Mobile Minimum Bar

| Feature | Why it is table stakes | Complexity | Dependencies |
|---|---|---|---|
| Open terminal on mobile without fighting layout | User explicitly required mobile usability | Medium | Mobile presentation container |
| Type and run commands while soft keyboard is open | Core mobile usability bar | High | Focus, viewport, resize coordination |
| Switch terminal tabs on mobile | Multi-session is also a v1 requirement on mobile | Medium | Simplified mobile tab strip |
| Read output comfortably on small screens | Terminal that technically works but is unreadable fails the requirement | High | Responsive layout and font sizing choices |

## Differentiators

These improve the experience but are not required to solve the current problem.

| Feature | Why it is differentiating | Complexity | Dependencies |
|---|---|---|---|
| File-tree "Open in Terminal" actions | Strong project-context affordance | Medium | File tree context menu wiring |
| Remember last cwd per terminal tab | Feels more editor-like and reduces friction | Medium | Session metadata + shell integration |
| Command detection / recent commands | Strong polish, but not needed for v1 usefulness | High | Shell integration semantics |
| Better file/link resolution in terminal output | Nice workflow acceleration for diagnostics | Medium | Terminal-output parsing + app routing |
| Persist terminal tabs across reloads | Valuable, but should follow once session model is proven | High | Durable session state |

## Anti-Features for v1

These are tempting but should be deliberately excluded in the first milestone.

| Feature | Why not v1 |
|---|---|
| Split terminal panes | User prioritized tab switching, not parallel pane layout |
| Full shell profile management UI | Adds configuration surface without solving the main pain point |
| Remote terminal / SSH / container orchestration | Different product scope from local project terminal integration |
| Heavy chat/agent automation into terminal | Valuable later, but not part of first usability milestone |
| Advanced command history UI and search | Nice-to-have after the core panel and session model work |
| Desktop-only shortcuts as primary navigation | Conflicts with explicit mobile usability requirement |

## Mobile Expectations

The mobile version should not try to mimic the desktop panel literally. It should preserve the same core capability with a different presentation:

- open terminal from an obvious mobile action
- show one active session clearly
- allow tab switching without tiny hit targets
- keep output readable while the keyboard is present
- avoid hiding critical actions behind hover or right-click assumptions

This is an inference from the repo's existing mobile navigation plus the user's stated requirement, not a quote from the sources.

## Dependency Order

1. Distinct terminal tab/session identity
2. Workspace panel/sheet host
3. Tab strip and lifecycle controls
4. Reliable reconnect / resize / activation behavior
5. Mobile-specific presentation and interaction refinements
6. Nice-to-have integrations like context-menu open and command history

## Sources

- VS Code terminal getting started: https://code.visualstudio.com/docs/terminal/getting-started
- VS Code shell integration: https://code.visualstudio.com/docs/terminal/shell-integration
- VS Code panel UX guidelines: https://code.visualstudio.com/api/ux-guidelines/panel

---
*Feature recommendation status: v1 should focus on integrated panel, project cwd, multi-tab sessions, and mobile core usability*
