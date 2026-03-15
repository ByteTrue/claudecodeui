# Requirements: Claude Code UI

**Defined:** 2026-03-16
**Core Value:** Users should be able to do their normal project work inside the app without breaking flow or leaving to a separate terminal window.

## v1 Requirements

### Workspace Integration

- [ ] **INTE-01**: User can open the integrated terminal from the current workspace UI
- [ ] **INTE-02**: User can collapse and reopen the terminal panel without losing current workspace context
- [ ] **INTE-03**: User can resize the terminal panel on desktop to allocate more or less vertical space
- [ ] **INTE-04**: New terminal tabs start in the current project/workspace root by default
- [ ] **INTE-05**: User can clearly tell which project/workspace a terminal tab belongs to

### Sessions

- [ ] **SESS-01**: User can create a new terminal tab from the integrated terminal panel
- [ ] **SESS-02**: User can switch between multiple terminal tabs without restarting other active tabs
- [ ] **SESS-03**: User can close an individual terminal tab
- [ ] **SESS-04**: User can restart an individual terminal session from the UI
- [ ] **SESS-05**: User can see each terminal tab's state such as connecting, running, disconnected, or exited
- [ ] **SESS-06**: User does not lose terminal output or active process state when switching between major app views during the same session

### Terminal Operation

- [ ] **TERM-01**: User can type commands into the integrated terminal and receive real-time output
- [ ] **TERM-02**: Terminal output and prompt layout remain correct when the panel size changes
- [ ] **TERM-03**: User can copy from and paste into the integrated terminal
- [ ] **TERM-04**: User can open URL-like links emitted in terminal output through an intentional UI interaction
- [ ] **TERM-05**: User receives visible feedback and a recovery path when the terminal transport disconnects unexpectedly

### Mobile

- [ ] **MOBL-01**: User can open and close the integrated terminal on mobile without blocking access to the rest of the workspace
- [ ] **MOBL-02**: User can focus terminal input on mobile and use the software keyboard without the active prompt becoming unusable
- [ ] **MOBL-03**: User can read recent terminal output comfortably on mobile
- [ ] **MOBL-04**: User can create, switch, and close terminal tabs with touch-friendly controls on mobile

## v2 Requirements

### Contextual Launching

- **CTX-01**: User can open a terminal directly from a selected directory in the file tree
- **CTX-02**: User can send a user-confirmed command from editor or chat context into a terminal tab

### Rich Shell Awareness

- **SHEL-01**: Terminal can track current working directory beyond initial launch context
- **SHEL-02**: Terminal can identify command boundaries and expose richer run-state metadata

### Persistence And Layout

- **PERS-01**: User can restore terminal tabs after a full page reload
- **LAYO-01**: User can view split terminal panes in the same workspace panel

## Out of Scope

| Feature | Reason |
|---------|--------|
| Split terminal panes in v1 | Tabbed sessions solve the primary workflow problem with less layout complexity |
| Advanced shell integration scripting in v1 | Not required to deliver baseline in-app terminal usability |
| Automatic agent-to-terminal execution in v1 | Safety and clarity matter more than deep automation in the first milestone |
| Full desktop shortcut parity on mobile | Mobile needs core usability, not full desktop feature parity |
| Full session restore across page reloads in v1 | Valuable later, but not required to stop users from leaving the app for common commands |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| INTE-01 | Phase 1 | Pending |
| INTE-02 | Phase 1 | Pending |
| INTE-03 | Phase 1 | Pending |
| INTE-04 | Phase 2 | Pending |
| INTE-05 | Phase 2 | Pending |
| TERM-01 | Phase 2 | Pending |
| TERM-02 | Phase 2 | Pending |
| SESS-01 | Phase 3 | Pending |
| SESS-02 | Phase 3 | Pending |
| SESS-03 | Phase 3 | Pending |
| SESS-04 | Phase 3 | Pending |
| SESS-05 | Phase 3 | Pending |
| SESS-06 | Phase 4 | Pending |
| MOBL-01 | Phase 4 | Pending |
| MOBL-02 | Phase 4 | Pending |
| MOBL-03 | Phase 4 | Pending |
| MOBL-04 | Phase 4 | Pending |
| TERM-03 | Phase 5 | Pending |
| TERM-04 | Phase 5 | Pending |
| TERM-05 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 20 total
- Mapped to phases: 20
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-16*
*Last updated: 2026-03-16 after roadmap creation*
