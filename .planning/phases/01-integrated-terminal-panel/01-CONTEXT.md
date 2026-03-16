# Phase 1: Integrated Terminal Panel - Context

**Gathered:** 2026-03-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Add a bottom-panel terminal to the existing workspace UI so users can open it from the current workspace, keep working in the rest of the app, collapse and reopen it without losing flow, and resize it on desktop. This phase is about panel integration only. Project-root launch behavior, multi-session tabs, mobile-specific behavior, and terminal hardening are separate later phases.

</domain>

<decisions>
## Implementation Decisions

### Panel behavior
- The terminal is a true bottom panel under the current workspace view, not a replacement full-page shell view.
- Opening the terminal must keep the current main workspace view visible above it.
- If the panel is open, it stays open while the user switches between main workspace views.
- The panel should span the full workspace width, including the editor area, rather than living only under the left content pane.
- Collapsing the panel should hide it fully rather than leaving a persistent bottom rail.

### Panel access
- Reuse the existing `Shell` control in the workspace chrome as the integrated terminal trigger.
- Opening the terminal should not change the current `activeTab`.
- If the terminal is already open and the user presses the trigger again, it should focus or bring forward the terminal rather than acting as a simple toggle-close.
- Replace the old full-page shell destination with the panel model instead of keeping both mental models alive.

### Desktop resize behavior
- The first open on desktop should feel roughly one-third of the workspace height.
- After the user resizes the panel, reopening it should remember the last desktop height.
- Desktop resizing should allow a flexible range rather than a narrow fixed band.
- The resize affordance should be explicit, with a visible grab strip.

### Claude's Discretion
- Exact visual treatment of the terminal panel header and chrome.
- Animation and motion details for open/close transitions.
- Fine-grained min/max resize thresholds, as long as they honor the chosen "flexible range" behavior.
- Exact focus styling and polish for "bring terminal forward" interactions.

</decisions>

<specifics>
## Specific Ideas

- The terminal should feel "naturally integrated" into the current project workspace, not bolted on.
- The desired interaction model is close to VS Code: terminal as shared workspace infrastructure, not a separate page.
- The user wants to stop leaving the app for common project commands; panel behavior should optimize for continuity of flow.

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/shell/view/Shell.tsx`: Existing xterm-based shell surface that can be reused inside the new panel rather than rebuilt.
- `src/components/standalone-shell/view/StandaloneShell.tsx`: Existing wrapper around `Shell` that can be adapted or split so the terminal can live outside the current full-page shell route.
- `src/components/shell/hooks/useShellConnection.ts`: Existing shell WebSocket lifecycle, useful as the single shell transport path while Phase 1 changes presentation.
- `src/components/shell/hooks/useShellTerminal.ts`: Existing terminal init, fit, copy/paste, and resize handling that should remain the shell runtime foundation.
- `src/components/code-editor/hooks/useEditorSidebar.ts`: Existing drag-resize interaction pattern that can inform desktop panel resizing behavior.

### Established Patterns
- `src/components/main-content/view/MainContent.tsx` currently treats major workspace surfaces as mutually exclusive `activeTab` views; Phase 1 needs to introduce a shared bottom region without breaking that overall workspace structure.
- `src/components/main-content/view/subcomponents/MainContentHeader.tsx` and `src/components/main-content/view/subcomponents/MainContentTabSwitcher.tsx` already define the desktop workspace chrome and existing `Shell` trigger location.
- `src/components/app/MobileNav.tsx` also includes a `Shell` nav item; mobile-specific behavior is not Phase 1 scope, but this file is an existing trigger surface that later phases will need to reconcile.
- The codebase already uses Tailwind-based feature modules and explicit hook extraction, so the panel should fit the existing feature-folder conventions rather than introduce a new UI architecture.

### Integration Points
- `src/components/main-content/view/MainContent.tsx`: Primary integration point for turning terminal from a full-page `activeTab === 'shell'` view into a shared bottom panel.
- `src/components/main-content/view/subcomponents/MainContentTabSwitcher.tsx`: Primary desktop trigger surface to repurpose from route/tab navigation into panel open/focus behavior.
- `src/components/app/AppContent.tsx`: Workspace-level layout container that will need to accommodate a full-width bottom panel without breaking sidebar/mobile shell.
- Existing shell subcomponents such as `src/components/shell/view/subcomponents/ShellHeader.tsx` are more full-page oriented and may need a lighter panel-specific chrome layer.

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-integrated-terminal-panel*
*Context gathered: 2026-03-16*
