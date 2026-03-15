# Pitfalls Research

**Domain:** VS Code-like integrated project terminal for a brownfield web coding workspace
**Researched:** 2026-03-16
**Confidence:** HIGH for codebase-specific risks, MEDIUM-HIGH for ecosystem guidance inferred from official docs

## Critical Pitfalls

### Pitfall 1: Rebuilding terminal transport instead of integrating the existing shell path

**What goes wrong:**
Teams treat the terminal milestone as a greenfield feature and build a second session model, second socket path, or second shell state store. In this codebase that would fork behavior already spread across `server/index.js`, `src/components/shell/hooks/useShellConnection.ts`, `src/components/shell/hooks/useShellRuntime.ts`, and `src/components/shell/hooks/useShellTerminal.ts`.

**Why it happens:**
The product gap is UX integration, but the code feels transport-heavy enough that people assume the backend must be replaced too. Brownfield teams also underestimate the regression risk of running parallel shell implementations.

**How to avoid:**
- Keep `/shell` and PTY lifecycle as the single execution path unless a hard blocker appears.
- Build the new bottom-panel terminal as a presentation/session-management layer over the existing shell runtime.
- Extract session management from `server/index.js` only where needed for clarity; do not create a competing shell service.

**Warning signs:**
- New terminal-specific socket endpoints appear before the existing `/shell` path is exhausted.
- Session identity, reconnect rules, or auth handling diverge between old and new terminal surfaces.
- The team starts maintaining both `StandaloneShell` and a new integrated shell with different behavior.

**Phase to address:**
Foundation and architecture phase.

**Mobile-specific risk:**
Duplicated shell implementations usually produce inconsistent mobile behavior first, because mobile-specific fixes land in only one of the two surfaces.

---

### Pitfall 2: Losing workspace context and tab identity

**What goes wrong:**
The terminal technically runs, but users still have to `cd` manually, cannot tell which tab belongs to which project/session, and lose confidence that commands are running in the right place.

**Why it happens:**
Teams optimize for "spawn PTY and show output" instead of binding terminal sessions to the current workspace, current cwd, and recognizable tab metadata. VS Code's shell integration exists precisely because raw terminal text is not enough to provide trustworthy context. This risk is amplified here because the product goal is to reduce context switching, not merely expose a shell.

**How to avoid:**
- Make current project/workspace path the source of truth for terminal creation.
- Persist tab metadata separate from render state: project, cwd, title, provider mode, session id, last activity, exit state.
- Design for shell integration metadata early, even if advanced decorations land later.

**Warning signs:**
- QA still opens the system terminal to confirm where commands are running.
- Tabs are named generically (`Shell`, `Terminal 2`) without project/cwd hints.
- Users frequently need to restart sessions after changing project or active session context.

**Phase to address:**
Terminal session model and panel integration phase.

**Mobile-specific risk:**
On smaller screens, users cannot see as much prompt context, so bad tab naming and missing cwd visibility hurt more than on desktop.

---

### Pitfall 3: Hidden-panel sizing and focus bugs

**What goes wrong:**
The bottom panel opens with a zero-height or partially rendered terminal, cursor focus is inconsistent, resize events lag, and switching between chat/editor/terminal causes clipped or stale layouts.

**Why it happens:**
Terminal surfaces are sensitive to visibility and container measurements. `xterm.js` expects the host element to be opened and refit when the container size changes; hidden panels and animated drawers often break that assumption. This codebase already relies on `FitAddon`, `ResizeObserver`, delayed init, and focus styles in `src/components/shell/hooks/useShellTerminal.ts`, which means the risk is real rather than hypothetical.

**How to avoid:**
- Treat "panel visible", "terminal opened", and "fit/resize sent to server" as a coordinated lifecycle.
- Refit on panel expand/collapse, tab switch, orientation change, and viewport resize.
- Keep a single focus owner for bottom-panel controls versus xterm input.
- Test with real mobile viewport changes, not only desktop devtools emulation.

**Warning signs:**
- First open after mount shows wrong rows/cols.
- Terminal becomes usable only after a manual window resize.
- Keyboard focus gets trapped in chat/editor instead of the terminal textarea.

**Phase to address:**
Panel layout and interaction phase.

**Mobile-specific risk:**
Virtual keyboard open/close and browser chrome resizing are a primary trigger here. Visual viewport changes must be handled intentionally on mobile.

---

### Pitfall 4: Ignoring session lifecycle leaks and WebSocket backpressure

**What goes wrong:**
Users see duplicated output, stale sockets, frozen terminals during noisy commands, or orphaned PTYs that keep running after the UI disconnects. Over time, multi-tab support becomes unreliable and expensive to debug.

**Why it happens:**
Terminal work often assumes a friendly output rate, but PTYs can emit large streams quickly. The browser WebSocket API exposes `bufferedAmount`, and `node-pty` documents flow-control support because this is a common failure mode. In this repo, shell lifecycle is already flagged as fragile in `.planning/codebase/CONCERNS.md`.

**How to avoid:**
- Define one authoritative lifecycle for create, reconnect, suspend, terminate, and resume.
- Track terminal sessions independently from rendered components so tab switches do not implicitly kill PTYs.
- Add output throttling/backpressure handling and explicit cleanup for dead sockets and exited PTYs.
- Test with long-running noisy commands (`npm install`, `git diff`, log tailing), not only short commands.

**Warning signs:**
- `terminal.write()` or socket event handlers become a hot path during heavy output.
- Reopening the panel duplicates lines or creates multiple sockets for the same terminal.
- `git status` feels fine but `npm run dev` or install logs freeze the UI.

**Phase to address:**
Foundation and hardening phases.

**Mobile-specific risk:**
Mobile browsers have tighter memory budgets and more aggressive background throttling, so lifecycle leaks surface faster.

---

### Pitfall 5: Treating terminal execution as a normal web form instead of a privileged host action

**What goes wrong:**
The feature ships with weak path/env validation, token leakage in URLs or logs, or command execution that is not clearly scoped to the selected workspace. A "nice terminal panel" becomes a security footgun.

**Why it happens:**
Browser UI makes the interaction feel like a harmless widget, but `node-pty` processes run with the same privileges as the server process. `node-pty` explicitly recommends containerization when running untrusted commands. This repo also already exposes shell auth through query-string URL generation in `src/components/shell/utils/socket.ts`, while `.planning/codebase/CONCERNS.md` flags query-token and logging risks.

**How to avoid:**
- Keep workspace path validation and auth boundaries explicit in the shell init flow.
- Minimize token-in-URL usage where the platform permits safer auth paths.
- Scrub logs around shell setup and command metadata.
- Treat shell launch, cwd selection, and provider/plain-shell modes as privileged flows with auditability.

**Warning signs:**
- Shell init starts accepting loosely validated paths or cwd overrides from the client.
- Debug logs include raw terminal init payloads or command text in production.
- Security review happens only after UI is "done."

**Phase to address:**
Security and hardening phase, with guardrails defined in foundation.

**Mobile-specific risk:**
Mobile users rely more on deep links, browser history, and share flows, which increases the blast radius of tokenized URLs.

---

### Pitfall 6: Designing mobile as a shrunken desktop terminal

**What goes wrong:**
The terminal technically appears on mobile, but typing is awkward, the on-screen keyboard obscures content, tab switching is cramped, and the bottom panel fights the browser viewport. Users stop trusting the feature outside desktop.

**Why it happens:**
Desktop-first terminal assumptions are strong: stable viewport, hardware keyboard, hover affordances, and roomy headers. Mobile browser terminals depend on hidden textarea input, visual viewport changes, and more constrained gestures. If mobile is deferred, the UI shape usually hardens around desktop assumptions first.

**How to avoid:**
- Design a mobile-specific panel behavior from day one: height strategy, sticky controls, tab affordances, and explicit focus/open states.
- Limit v1 mobile ambition to the promised core loop: open, input, output, switch tabs.
- Validate with real iOS and Android devices, including keyboard open/close and orientation change.

**Warning signs:**
- Mobile QA requires pinch/zoom or horizontal panning to use the terminal.
- Tab controls become too small once the keyboard is open.
- The feature is "supported" on mobile only when using an external keyboard.

**Phase to address:**
Mobile adaptation and UX verification phase.

**Mobile-specific risk:**
This pitfall is itself the mobile-specific risk; if it is not owned explicitly, mobile becomes an afterthought despite being part of the milestone definition.

---

### Pitfall 7: Scope creep into split panes, automation, and terminal power-user features before the core loop is stable

**What goes wrong:**
Roadmap energy goes into split terminals, shell-command automation, deep agent integrations, or advanced persistence before the bottom-panel, project-bound, tabbed terminal is trustworthy. Delivery slows and the user’s main pain point remains unsolved.

**Why it happens:**
Terminal features invite "while we're here" thinking. VS Code-like can be misread as "feature parity with years of terminal evolution" instead of "familiar workflow shape." The current `PROJECT.md` already calls split panes and deep automation out of scope for this reason.

**How to avoid:**
- Tie every v1 requirement back to the core value: staying in the app for normal project commands.
- Gate advanced features behind proof that the basic bottom-panel + tab workflow is stable on desktop and mobile.
- Keep roadmap phases narrow and verify user-visible flow before adding power features.

**Warning signs:**
- The roadmap starts with split panes, command history sync, or agent-to-shell automation.
- Multiple advanced terminal controls land before reliable session switching.
- Mobile usability remains vague while desktop-only power features accumulate.

**Phase to address:**
Requirements scoping and roadmap creation phase.

**Mobile-specific risk:**
Scope creep usually steals time from mobile adaptation first, because advanced desktop features feel easier to demonstrate.

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| New integrated panel bypasses `src/components/shell/` and talks to `/shell` directly | Faster demo | Two terminal lifecycles to maintain | Never |
| Store tab/session state only in component-local React state | Quick implementation | Tabs reset on remounts, impossible reconnection rules | Only for disposable prototypes, not milestone code |
| Hard-code desktop panel height/keyboard assumptions | Faster layout work | Mobile breakage and repeated resize bugs | Never if mobile is in v1 |
| Keep all orchestration inside `server/index.js` | Fewer files changed today | Server shell work becomes harder to reason about with each iteration | Acceptable only if changes are tiny and followed by extraction in the same milestone |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| `node-pty` in `server/index.js` | Treating PTY spawn as safe because it is "local only" | Treat terminal execution as privileged host execution; validate cwd/env and prefer containment where possible |
| `@xterm/xterm` in `src/components/shell/hooks/useShellTerminal.ts` | Opening/fitting once and assuming layout is solved | Refit on panel visibility, tab switches, orientation changes, and viewport changes |
| Shell auth in `src/components/shell/utils/socket.ts` | Accepting token-in-query as harmless plumbing | Minimize URL token usage and avoid expanding it to more flows than necessary |
| `StandaloneShell` in `src/components/standalone-shell/view/StandaloneShell.tsx` | Layering a second integrated-terminal implementation beside it | Reuse the shell runtime and move integration logic upward into shared session/panel state |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Heavy output with no backpressure plan | Frozen UI, delayed typing, dropped frames | Watch WebSocket buffering, test noisy commands, and add flow-control/cleanup rules | Breaks quickly with installs, logs, and long diffs |
| Recreating xterm instances on every tab/panel transition | Memory churn, lost scrollback, reconnect storms | Separate terminal session lifecycle from view visibility | Breaks as soon as users keep several tabs open |
| Resize spam from animated panel transitions | Excess resize messages and flicker | Debounce resize, send authoritative size changes only after layout settles | Breaks on bottom-sheet animations and orientation changes |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Letting client-provided cwd or project path drift from validated workspace state | Command execution in the wrong location or beyond intended boundaries | Resolve shell cwd from validated project/workspace state on the server |
| Logging terminal init payloads, auth URLs, or command metadata | Sensitive path/token leakage | Strip or gate shell logs and keep production logging minimal |
| Treating terminal tabs as a harmless UI-only feature | Missing review of the host-execution boundary | Include security review in the same milestone as session-model work |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Terminal lives as just another hidden tab with no persistent presence | Still feels separate from core workflow | Use a bottom-panel model with clear open/close affordances and retained session context |
| Tabs do not expose enough identity | Users run commands in the wrong place or second-guess themselves | Show project/cwd-aware labels and clear active-state feedback |
| Mobile terminal exposes the same dense header as desktop | Core actions become hard to hit while keyboard is open | Prioritize a compact mobile control set focused on tabs, run state, and close/reopen |

## "Looks Done But Isn't" Checklist

- [ ] **Project-bound terminal:** Often missing real cwd guarantees — verify server-side cwd always comes from validated workspace state
- [ ] **Multi-tab terminal:** Often missing stable session ownership — verify tabs survive panel hide/show without duplicate sockets
- [ ] **Responsive terminal panel:** Often missing real resize handling — verify first-open, rotate, and keyboard-open all preserve usable rows/cols
- [ ] **Mobile support:** Often missing practical typing flow — verify common commands can be entered on real phones without layout breakdown
- [ ] **Security review:** Often missing log/auth cleanup — verify shell URLs, tokens, and command metadata are not leaking into logs or history

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Duplicate shell implementations | HIGH | Collapse on one shell runtime, migrate UI state to shared session model, remove competing transport paths |
| Broken tab identity / wrong cwd | MEDIUM | Add explicit session metadata, invalidate ambiguous sessions, and migrate to server-derived workspace binding |
| Resize/focus instability | MEDIUM | Centralize panel visibility events, refit/resend size after layout settles, re-test mobile viewport handling |
| Socket leaks / PTY orphaning | HIGH | Add lifecycle instrumentation, terminate orphan sessions, and build reconnect/cleanup rules before more features |
| Mobile unusability | MEDIUM | Reduce v1 mobile surface to core controls, redesign panel height/controls for keyboard-open state, and validate on device |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Rebuilding terminal transport | Foundation / architecture | Existing `/shell` path remains the single execution path for the integrated terminal |
| Losing workspace context and tab identity | Session model / panel integration | New tabs always launch in the validated project context and keep recognizable metadata |
| Hidden-panel sizing and focus bugs | Panel layout / interaction | Open-close, tab switch, and rotate flows keep correct size and focus on desktop and mobile |
| Session leaks and backpressure | Foundation + hardening | No duplicate sockets; noisy commands remain responsive; exited sessions clean up correctly |
| Weak execution boundary | Security hardening | Shell init paths, auth handling, and logging pass explicit review |
| Desktop-first mobile failure | Mobile adaptation | Real-device checks confirm open, type, output, and tab switch are all usable |
| Scope creep | Requirements + roadmap | Phase 1-2 deliver the core bottom-panel loop before advanced terminal features appear |

## Sources

- Project context: `/Users/21jie/workspace/personal/claudecodeui/.planning/PROJECT.md`
- Existing concern map: `/Users/21jie/workspace/personal/claudecodeui/.planning/codebase/CONCERNS.md`
- Existing shell transport and UI paths:
  - `server/index.js`
  - `src/components/shell/hooks/useShellConnection.ts`
  - `src/components/shell/hooks/useShellRuntime.ts`
  - `src/components/shell/hooks/useShellTerminal.ts`
  - `src/components/standalone-shell/view/StandaloneShell.tsx`
  - `src/components/main-content/view/MainContent.tsx`
- `xterm.js` docs and API references (official / primary source): https://xtermjs.org/docs/ and https://xtermjs.org/docs/api/terminal/classes/terminal/
- `node-pty` repository README (official / primary source): https://github.com/microsoft/node-pty
- VS Code terminal documentation (official / primary source): https://code.visualstudio.com/docs/terminal/basics and https://code.visualstudio.com/docs/terminal/shell-integration
- MDN WebSocket buffering reference (primary source): https://developer.mozilla.org/docs/Web/API/WebSocket/bufferedAmount
- MDN Visual Viewport reference (primary source): https://developer.mozilla.org/docs/Web/API/Visual_Viewport_API

---
*Pitfalls research for: integrated project terminal in Claude Code UI*
*Researched: 2026-03-16*
