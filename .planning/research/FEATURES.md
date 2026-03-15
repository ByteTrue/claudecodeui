# Feature Research

**Domain:** Integrated VS Code-like project terminal inside an existing coding workspace app
**Researched:** 2026-03-16
**Confidence:** HIGH for desktop table stakes, MEDIUM for mobile-first expectations

## Feature Landscape

### Table Stakes (Users Expect These)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Bottom-panel integrated terminal | VS Code sets the mental model: terminal is part of the workspace, not a separate tool | MEDIUM | Should feel attached to the current project view; on mobile this likely becomes a keyboard-safe drawer or full-height sheet instead of a tiny fixed panel |
| New terminals start in the active project/workspace directory | Users expect to run commands immediately without manual `cd` steps | LOW | This directly addresses the user's main pain point and should be the default behavior for every new session |
| Multiple terminal sessions with tab switching | VS Code users assume they can keep separate command contexts alive and switch quickly | MEDIUM | v1 can stop at tabs; split panes are common but not required to validate the workflow |
| Stable terminal I/O with resize, scrollback, and panel hide/show continuity | Long-running commands are routine; collapsing the panel must not kill the work | MEDIUM | Full reload persistence can be deferred, but hiding the panel, changing tabs, or navigating the app should not feel fragile |
| Copy/paste, text selection, and clickable output links | These are baseline productivity affordances in modern integrated terminals | LOW | Critical for workflows like opening localhost URLs, copying errors, and re-running commands |
| Mobile core usability | This project explicitly targets mobile; the terminal cannot become desktop-only dead weight | HIGH | Minimum expectation is open, type, submit, inspect output, and switch sessions without relying on desktop-only shortcuts |

### Differentiators (Competitive Advantage)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| "Open terminal here" from file tree or directory context | Removes the last manual navigation step for nested workspaces | MEDIUM | Best added after workspace-root launch is solid; depends on file-tree context actions |
| Session persistence across refresh/reconnect | Makes the terminal feel dependable during navigation hiccups or mobile interruptions | HIGH | Valuable, but operationally more complex than simple panel continuity because it needs server-side lifecycle rules |
| Long-running command status and completion cues | Helps users multitask inside the app without babysitting builds or installs | MEDIUM | Mobile benefits most from lightweight completion indicators or notifications because the terminal is not always visible |
| Explicit handoff from chat or task suggestions to terminal | Tightens the loop between AI suggestions and command execution while keeping the user in control | MEDIUM | Should be explicit, not autonomous: "Run in terminal" is safer than auto-executing commands |
| Mobile-first terminal controls | Most browser IDEs treat mobile as second-class; a genuinely usable touch workflow would stand out | HIGH | Examples: larger tab targets, overflow session switcher, sticky run/new controls, and better keyboard avoidance |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Split panes in v1 | VS Code has split terminals, so users may ask for parity | Adds layout, resize, focus, and mobile complexity before the core panel workflow is proven | Ship tabs first, add split only after tabbed workflows are stable |
| Full desktop parity on mobile | "Make it exactly like desktop" sounds simpler than defining a mobile UX | Dense tab bars, tiny controls, and keyboard shortcuts do not translate cleanly to touch devices | Define a mobile-specific core path: open, type, submit, view, switch |
| Deep agent/chat auto-execution | It promises convenience by turning AI suggestions directly into shell actions | Raises trust, safety, undo, and auditability issues too early | Use explicit, user-confirmed handoff actions such as "Send command to terminal" |
| Heavy persistence/restore guarantees in v1 | Users like the idea of never losing terminal state | True reload/restart recovery adds backend session retention, cleanup, and reconnection complexity | Preserve sessions while the app is open first, then add stronger persistence later |

## Feature Dependencies

```text
[Bottom-panel terminal]
    └──requires──> [Workspace-scoped launch]
                       └──enables──> [Immediate project command execution]

[Tabbed sessions]
    └──requires──> [Session metadata + lifecycle management]
                       └──enhances──> [Continuity across panel hide/show]

[Mobile core usability]
    └──requires──> [Responsive terminal layout]
                       └──conflicts──> [Split panes in v1]

[Chat/task handoff]
    └──requires──> [Stable terminal session targeting]
                       └──requires──> [User-confirmed execution model]

[Refresh/reconnect persistence]
    └──requires──> [Server-side session retention rules]
                       └──requires──> [Reliable reconnect semantics]
```

### Dependency Notes

- **Bottom-panel terminal requires workspace-scoped launch:** The terminal only feels native if a new session already knows which project it belongs to.
- **Tabbed sessions require session metadata and lifecycle management:** Once users have multiple sessions, the app needs naming, active-state, close behavior, and server-side bookkeeping.
- **Mobile core usability requires responsive layout and conflicts with split panes:** Touch-first terminal use needs simpler controls and larger hit areas; split panes fight that constraint.
- **Chat/task handoff requires stable terminal targeting:** A "Run in terminal" action is only safe if the app can clearly target the intended session or create a fresh one.
- **Refresh/reconnect persistence requires stronger backend rules:** This should not be bundled into the first milestone unless continuity during normal in-app navigation is already dependable.

## MVP Definition

### Launch With (v1)

- [ ] Bottom-panel integrated terminal — matches user expectations and fits the existing workspace model
- [ ] New sessions start in the active project/workspace directory — removes the manual `cd` tax
- [ ] Multiple terminal tabs with quick switching — user explicitly called this part of "usable"
- [ ] Stable terminal surface with resize, scrollback, copy/paste, and link handling — baseline productivity and debugging affordances
- [ ] Mobile core usability for open, input, output, and session switching — required by project scope, not a later polish task

### Add After Validation (v1.x)

- [ ] "Open terminal here" from file tree or folder context — useful once the default workspace-root flow is solid
- [ ] Session rename and lightweight persistence across reconnects — add when users are clearly juggling several concurrent sessions
- [ ] Long-running command status cues or completion notifications — add when background-task usage becomes common

### Future Consideration (v2+)

- [ ] Split terminal panes — valuable for advanced workflows, but not worth the initial UI cost
- [ ] Explicit chat/task to terminal handoff actions — useful once the basic terminal model is trusted
- [ ] Strong session restore across refresh/restart — defer until server lifecycle semantics are deliberately designed

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Bottom-panel integrated terminal | HIGH | MEDIUM | P1 |
| Workspace-root default launch | HIGH | LOW | P1 |
| Multi-session tabs | HIGH | MEDIUM | P1 |
| Stable I/O + resize + copy/paste + links | HIGH | MEDIUM | P1 |
| Mobile core usability | HIGH | HIGH | P1 |
| "Open terminal here" actions | MEDIUM | MEDIUM | P2 |
| Reconnect/session persistence | MEDIUM | HIGH | P2 |
| Long-running command status cues | MEDIUM | MEDIUM | P2 |
| Chat/task handoff to terminal | MEDIUM | MEDIUM | P3 |
| Split panes | MEDIUM | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have after the core workflow is proven
- P3: Nice to have or defer until later validation

## Competitor Feature Analysis

| Feature | VS Code | Browser-based VS Code workspaces | Our Approach |
|---------|---------|----------------------------------|--------------|
| Integrated terminal in workspace | Core built-in behavior | Expected in browser-hosted editor experiences too | Match the same mental model with a bottom-panel terminal |
| Multiple terminals | Supported via tabs and management actions | Expected when the editor experience is VS Code-like | Ship tabs in v1; defer split panes |
| Persistent continuity | Strong support, including process/session persistence features | Users still expect continuity even if implementation differs | Preserve sessions during in-app navigation first, then extend persistence deliberately |
| Shell productivity affordances | Copy/paste, links, shell integration, command decorations | Same expectation carries over to web workspaces | Launch with baseline affordances; richer command semantics can come later |
| Mobile usability | Not a primary strength | Usually weak across browser IDEs | Treat mobile core usability as part of launch scope |

## Sources

- VS Code Integrated Terminal overview and basics: `https://code.visualstudio.com/docs/terminal/basics`
- VS Code terminal appearance and tab management: `https://code.visualstudio.com/docs/terminal/appearance`
- VS Code advanced terminal behavior and persistence concepts: `https://code.visualstudio.com/docs/terminal/advanced`
- VS Code shell integration capabilities: `https://code.visualstudio.com/docs/terminal/shell-integration`
- Project context: `/Users/21jie/workspace/personal/claudecodeui/.planning/PROJECT.md`

---
*Feature research for: integrated project terminal*
*Researched: 2026-03-16*
