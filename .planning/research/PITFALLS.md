# Research: Pitfalls for Integrated Project Terminal

**Date:** 2026-03-16  
**Scope:** Identify the highest-risk mistakes when evolving the current shell feature into a VS Code-like integrated project terminal.

## Pitfall 1: Treating Existing Shell Infrastructure As The Finished Product

### Why It Happens

The repo already has xterm, node-pty, and a shell tab, so it is easy to assume the feature is mostly done.

### Warning Signs

- roadmap focuses on tiny cosmetic tweaks only
- no work is planned around bottom-panel integration or tab state
- mobile is treated as “we will see later”

### Prevention

- define the milestone as a product integration problem, not a PTY plumbing problem
- explicitly plan layout, tabs, project cwd behavior, and mobile usage

### Phase To Address

Early integration phase

## Pitfall 2: Rebuilding The Terminal Stack Instead Of Reusing It

### Why It Happens

Teams often reach for new libraries when the real issue is orchestration and UX.

### Warning Signs

- proposals introduce a second terminal renderer
- proposals introduce a second backend channel separate from `/shell`
- major refactors happen before validating the bottom-panel flow

### Prevention

- keep `@xterm/xterm`, `node-pty`, and `/shell`
- limit v1 work to integration, state, lifecycle, and mobile fit

### Phase To Address

Architecture / implementation planning

## Pitfall 3: Weak PTY Security Assumptions

### Why It Happens

An integrated terminal feels like a UI feature, but it is also remote command execution from a web surface.

### Warning Signs

- shell access is treated as harmless because it is “local”
- auth/authorization checks on WebSocket shell access are not reviewed during changes
- project path and session identifiers are passed through without strict validation

### Prevention

- review `/shell` authentication and path/session validation while changing the feature
- keep permissions least-privileged
- avoid widening shell access semantics implicitly through convenience features

### Phase To Address

Session / backend phase

### Source-Backed Note

`node-pty` warns that spawned processes run with the same permission level as the parent process. xterm.js security guidance also warns that browser-based terminal integrations raise security requirements substantially.

## Pitfall 4: Ignoring Flow Control And Large Output Behavior

### Why It Happens

Simple commands work fine, so teams miss the heavy-output cases until later.

### Warning Signs

- terminal becomes sluggish on build/test output
- browser input lags during long-running commands
- memory or buffer growth appears under noisy processes

### Prevention

- test with large-output commands early
- if needed, add ACK-based flow control over the existing WebSocket channel
- review whether `node-pty` flow-control support should be enabled or used selectively

### Phase To Address

Implementation hardening

### Source-Backed Note

xterm.js documents that WebSocket-backed terminals can require extra flow-control handling. node-pty also documents optional flow-control support.

## Pitfall 5: Losing Session Identity During UI Navigation

### Why It Happens

The existing shell was designed around a dedicated view. A bottom panel with tabs changes lifecycle assumptions.

### Warning Signs

- switching app tabs disconnects terminals unexpectedly
- switching terminal tabs restarts shell processes
- output disappears when panel visibility changes

### Prevention

- separate “visible/active” state from “session alive” state
- design explicit tab lifecycle rules
- test hide/show, project switch, and reconnect paths

### Phase To Address

Product integration phase

## Pitfall 6: Desktop-First Layout Decisions That Break On Mobile

### Why It Happens

Terminal UIs are often designed on wide screens and then squeezed onto phones later.

### Warning Signs

- tiny tap targets in the terminal tab strip
- keyboard overlap hides the prompt
- too much header chrome leaves little output space
- desktop-only assumptions about hover, shortcuts, or simultaneous views

### Prevention

- define mobile as first-version scope
- use a mobile-specific panel behavior while keeping the same terminal engine
- prioritize focus, readable output, and simple tab actions over dense controls

### Phase To Address

UI integration and polishing

## Pitfall 7: Overcommitting To Rich Shell Integration In v1

### Why It Happens

VS Code shell integration features are attractive, so teams try to reproduce everything at once.

### Warning Signs

- command decorations and cwd intelligence dominate the milestone
- tabbed sessions and panel integration remain unfinished while shell metadata work grows
- shell-script injection work blocks baseline terminal usability

### Prevention

- treat shell integration as a follow-on enhancement
- prioritize baseline usability: panel, tabs, project cwd, mobile, stability
- only add richer shell metadata if it directly unlocks a concrete v1 requirement

### Phase To Address

Scope control throughout planning

## Pitfall 8: Unsafe Link / Output Handling

### Why It Happens

Terminal output can look like URLs, paths, or escape-sequence-driven links, and naive handling can create security or UX issues.

### Warning Signs

- output-derived links open without clear user action
- terminal text is reused in the DOM unsafely
- custom parsing of terminal output grows without guardrails

### Prevention

- keep link handling explicit and modifier/click gated where appropriate
- treat terminal output as untrusted data
- avoid DOM injection patterns based on terminal content

### Phase To Address

Implementation hardening

## Recommended Risk Order

Address earliest:

1. product integration scope
2. tab/session lifecycle
3. mobile usability
4. security review
5. output/flow-control hardening

## Sources

- xterm.js security guide: https://xtermjs.org/docs/guides/security/
- xterm.js link handling guide: https://xtermjs.org/docs/guides/link-handling/
- xterm.js flow control guide: https://xtermjs.org/docs/guides/flowcontrol/
- node-pty README: https://github.com/microsoft/node-pty
