# Roadmap: Claude Code UI

## Overview

This roadmap turns the existing shell infrastructure into a workspace-native terminal experience. The work starts by embedding terminal access into the current UI, then makes terminal launch project-aware, adds multi-session tab lifecycle, adapts the experience for mobile, and finishes with interaction hardening and recovery behavior.

## Phases

- [x] **Phase 1: Integrated Terminal Panel** - Add a bottom-panel terminal that feels native to the existing workspace layout (completed 2026-03-16)
- [x] **Phase 2: Project-Aware Terminal Launch** - Make integrated terminals launch and behave in the current project context (completed 2026-03-21)
- [ ] **Phase 3: Multi-Session Terminal Tabs** - Add tabbed terminal sessions with explicit lifecycle and status handling
- [ ] **Phase 4: Mobile And Workflow Continuity** - Preserve terminal state during normal app use and make the feature core-usable on mobile
- [ ] **Phase 5: Terminal Hardening And Recovery** - Polish terminal interactions, safe link behavior, and disconnect/recovery UX

## Phase Details

### Phase 1: Integrated Terminal Panel
**Goal**: Users can open a bottom-panel terminal from the current workspace and use it without leaving the rest of the app.
**Depends on**: Nothing (first phase)
**Requirements**: [INTE-01, INTE-02, INTE-03]
**Success Criteria** (what must be TRUE):
  1. User can open the integrated terminal from the current workspace UI without switching to a dedicated shell page.
  2. User can collapse and reopen the terminal panel while staying in the same workspace flow.
  3. User can resize terminal panel height on desktop and the panel remains visually integrated with the main layout.
**Plans**: 3 plans

Plans:
- [x] 01-01: Embed the terminal panel container and controls into the main workspace layout
- [x] 01-02: Wire panel open/close behavior to the existing shell surface without breaking current navigation
- [x] 01-03: Implement desktop resize behavior and visual integration polish for the panel

### Phase 2: Project-Aware Terminal Launch
**Goal**: Integrated terminals launch in the correct project context and behave reliably as live terminals.
**Depends on**: Phase 1
**Requirements**: [INTE-04, INTE-05, TERM-01, TERM-02]
**Success Criteria** (what must be TRUE):
  1. New terminal launches default to the selected project/workspace root.
  2. User can clearly identify which project/workspace a terminal belongs to from the integrated UI.
  3. User can type commands and receive real-time output inside the integrated terminal panel.
  4. Prompt and output layout remain correct when the terminal panel size changes.
**Plans**: 2 plans

Plans:
- [x] 02-01: Bind terminal creation and shell initialization to the selected project/workspace context
- [x] 02-02: Surface project identity in the terminal UI and stabilize integrated terminal fit/output behavior

### Phase 3: Multi-Session Terminal Tabs
**Goal**: Users can work with multiple terminal sessions in parallel from a single integrated panel.
**Depends on**: Phase 2
**Requirements**: [SESS-01, SESS-02, SESS-03, SESS-04, SESS-05]
**Success Criteria** (what must be TRUE):
  1. User can create, switch, and close multiple terminal tabs from the integrated panel.
  2. Switching tabs does not restart other active terminal sessions.
  3. User can restart an individual terminal session from the UI.
  4. Each terminal tab exposes clear status such as connecting, running, disconnected, or exited.
**Plans**: 3 plans

Plans:
- [ ] 03-01: Add frontend terminal tab state, creation, selection, close, and restart controls
- [ ] 03-02: Extend backend/session coordination for stable tab-to-terminal identity and status reporting
- [ ] 03-03: Harden tab switching behavior so inactive tabs remain intact while the active tab changes

### Phase 4: Mobile And Workflow Continuity
**Goal**: Terminal sessions survive normal app navigation and remain core-usable on mobile.
**Depends on**: Phase 3
**Requirements**: [SESS-06, MOBL-01, MOBL-02, MOBL-03, MOBL-04]
**Success Criteria** (what must be TRUE):
  1. User does not lose terminal output or active process state when moving between major app views during the same session.
  2. User can open and close the terminal on mobile without losing the rest of the workspace.
  3. User can focus terminal input on mobile and use the software keyboard without making the prompt unusable.
  4. User can read output and manage terminal tabs with touch-friendly controls on mobile.
**Plans**: 3 plans

Plans:
- [ ] 04-01: Preserve terminal session state across normal workspace navigation and panel visibility changes
- [ ] 04-02: Implement mobile-specific panel, viewport, and keyboard behavior for the integrated terminal
- [ ] 04-03: Adapt tab controls and output presentation for touch-first terminal use

### Phase 5: Terminal Hardening And Recovery
**Goal**: The integrated terminal behaves safely and predictably during copy/paste, link interaction, and transport interruptions.
**Depends on**: Phase 4
**Requirements**: [TERM-03, TERM-04, TERM-05]
**Success Criteria** (what must be TRUE):
  1. User can copy from and paste into the integrated terminal reliably.
  2. URL-like terminal output opens only through intentional user interaction.
  3. User receives clear disconnect or reconnect feedback and has a visible recovery path when shell transport drops.
**Plans**: 2 plans

Plans:
- [ ] 05-01: Polish copy/paste behavior and safe link interaction in the integrated terminal
- [ ] 05-02: Add disconnect, reconnect, and recovery UX plus transport hardening for failure cases

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Integrated Terminal Panel | 3/3 | Complete   | 2026-03-16 |
| 2. Project-Aware Terminal Launch | 2/2 | Complete | 2026-03-21 |
| 3. Multi-Session Terminal Tabs | 0/3 | Not started | - |
| 4. Mobile And Workflow Continuity | 0/3 | Not started | - |
| 5. Terminal Hardening And Recovery | 0/2 | Not started | - |
