# WebSocket Endpoints

> Contracts and conventions for WebSocket endpoints in this project.

---

## Overview

This project uses WebSocket for real-time communication between frontend and backend. Each endpoint has specific message protocols and lifecycle management requirements.

---

## Endpoint: `/terminal`

### 1. Scope / Trigger

**Trigger**: Terminal feature requires real-time bidirectional communication for shell I/O.

**Purpose**: Provides a persistent terminal session using PTY (pseudo-terminal) for running shell commands.

### 2. Signatures

**Backend Handler**: `handleTerminalConnection(ws: WebSocket)`

**Location**: `server/index.js` (line ~1623)

**PTY Spawn**:
```javascript
const terminalProcess = pty.spawn(shell, shellArgs, {
  name: 'xterm-256color',
  cols: termCols,
  rows: termRows,
  cwd: projectPath,
  env: { ...process.env, TERM: 'xterm-256color', COLORTERM: 'truecolor', FORCE_COLOR: '3' }
});
```

### 3. Contracts

#### Client → Server Messages

**Init Message**:
```typescript
{
  type: 'init',
  cols: number,      // Terminal columns (e.g., 80)
  rows: number       // Terminal rows (e.g., 24)
}
```

**Input Message**:
```typescript
{
  type: 'input',
  data: string       // User input (keystrokes)
}
```

**Resize Message**:
```typescript
{
  type: 'resize',
  cols: number,      // New column count
  rows: number       // New row count
}
```

#### Server → Client Messages

**Output Data**: Raw string data from PTY process (not JSON)

**Connection States**:
- `onopen`: Connection established, ready for init
- `onmessage`: Terminal output data
- `onclose`: Connection closed, PTY process terminated
- `onerror`: Connection error

#### Environment

**Required**:
- None (uses system default shell)

**Optional**:
- `projectPath`: Working directory (defaults to server CWD if not provided)

### 4. Validation & Error Matrix

| Condition | Error/Behavior |
|-----------|----------------|
| No auth token | Connection rejected with "WebSocket authentication failed" |
| Invalid message type | Ignored (no error thrown) |
| PTY spawn fails | Connection closes, error logged |
| Client disconnects | PTY process killed immediately |
| Resize before init | Ignored (no PTY process yet) |
| Input before init | Ignored (no PTY process yet) |

### 5. Good/Base/Bad Cases

#### Good Case
```javascript
// Client sends init with proper dimensions
ws.send(JSON.stringify({
  type: 'init',
  cols: 80,
  rows: 24
}));

// Server spawns PTY and starts sending output
// Client receives raw terminal output
term.write(event.data);

// Client sends user input
ws.send(JSON.stringify({
  type: 'input',
  data: 'ls\r'  // Note: \r for Enter key
}));
```

#### Base Case
```javascript
// Client connects and immediately sends init
// No projectPath specified, uses server CWD
ws.send(JSON.stringify({
  type: 'init',
  cols: 80,
  rows: 24
}));
```

#### Bad Case
```javascript
// ❌ Sending input before init
ws.send(JSON.stringify({
  type: 'input',
  data: 'ls\r'
}));
// Result: Ignored, no PTY process exists yet

// ❌ Forgetting to include \r for Enter key
ws.send(JSON.stringify({
  type: 'input',
  data: 'ls'  // Missing \r
}));
// Result: Command typed but not executed
```

### 6. Tests Required

**Unit Tests**:
- Message parsing (init/input/resize)
- PTY spawn with correct parameters
- Environment variable setup

**Integration Tests**:
- Full connection lifecycle (connect → init → input → output → disconnect)
- PTY process cleanup on disconnect
- Resize handling during active session

**Assertion Points**:
- PTY process spawned with correct shell
- Terminal dimensions applied correctly
- User input reaches PTY stdin
- PTY output reaches WebSocket client
- Process killed on disconnect

### 7. Wrong vs Correct

#### Wrong: Conditional Rendering in React

```typescript
// ❌ Don't conditionally render Terminal component
{isOpen && <Terminal />}

// Problem: Component unmounts when closed, destroying WebSocket connection
// and losing terminal session
```

#### Correct: Always Mount, Hide with CSS

```typescript
// ✅ Always mount, control visibility with CSS
<div className={isOpen ? 'translate-y-0' : 'translate-y-full'}>
  <Terminal />
</div>

// Benefit: WebSocket connection and terminal session persist when panel is hidden
```

---

## Endpoint: `/shell`

### Purpose

Provides shell sessions for AI assistant CLIs (Claude Code, Cursor, Codex).

**Key Difference from `/terminal`**:
- `/shell`: Manages AI CLI sessions with session persistence
- `/terminal`: Simple PTY for user commands, no session management

**Location**: `server/index.js` (line ~1706)

*(Detailed spec to be added when needed)*

---

## Endpoint: `/ws`

### Purpose

Main WebSocket endpoint for chat interface and AI interactions.

**Location**: `server/index.js` (line ~1465)

*(Detailed spec to be added when needed)*

---

## Common Patterns

### Authentication

All WebSocket endpoints require authentication via token:

```javascript
const token = localStorage.getItem('auth-token');
const wsUrl = `${protocol}//${host}/endpoint?token=${encodeURIComponent(token)}`;
```

**Backend Validation**:
```javascript
const token = url.searchParams.get('token');
const user = await authenticateToken(token);
if (!user) {
  console.log('[WARN] WebSocket authentication failed');
  ws.close();
  return;
}
```

### Vite Dev Server Proxy

When adding a new WebSocket endpoint, **must** add proxy config in `vite.config.js`:

```javascript
server: {
  proxy: {
    '/terminal': {
      target: `ws://${proxyHost}:${port}`,
      ws: true
    }
  }
}
```

**Why**: Vite dev server runs on different port (5173) than backend (3001). Without proxy, WebSocket connections fail in development.

---

## Common Mistakes

### Mistake 1: Forgetting Vite Proxy Config

**Symptom**: WebSocket connection fails with "WebSocket is closed before the connection is established"

**Cause**: New WebSocket endpoint not proxied in `vite.config.js`

**Fix**: Add proxy configuration for the new endpoint

**Prevention**: Always update `vite.config.js` when adding new WebSocket endpoints

### Mistake 2: Conditional Component Rendering

**Symptom**: Terminal session resets when reopening panel

**Cause**: Component unmounts when hidden, destroying WebSocket connection

**Fix**: Use CSS to hide component instead of conditional rendering

**Prevention**: For components with persistent connections, always mount and control visibility with CSS

### Mistake 3: Missing \r in Terminal Input

**Symptom**: Commands typed but not executed in terminal

**Cause**: Enter key requires `\r` character, not just `\n`

**Fix**: Append `\r` to commands: `data + '\r'`

**Prevention**: Use xterm.js `onData` event which handles this automatically

---

## Design Decisions

### Decision: Separate `/terminal` from `/shell`

**Context**: Initially considered reusing `/shell` endpoint for terminal feature.

**Options Considered**:
1. Reuse `/shell` with `isPlainShell` flag
2. Create separate `/terminal` endpoint

**Decision**: Created separate `/terminal` endpoint because:
- Cleaner separation of concerns
- `/shell` has complex session management for AI CLIs
- `/terminal` is simpler: just PTY I/O, no session persistence
- Easier to maintain and debug

**Extensibility**: If terminal needs session management in future, can add without affecting `/shell` behavior.

### Decision: System Default Shell

**Context**: Users wanted to choose shell type (bash, zsh, fish, etc.).

**Options Considered**:
1. Add shell selection in settings
2. Use system default shell
3. Hardcode bash/PowerShell

**Decision**: Use system default shell because:
- Simpler implementation
- Respects user's system configuration
- No need for shell detection logic
- Works across platforms automatically

**Implementation**:
```javascript
const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
```

**Future**: If users request shell selection, can add as enhancement without breaking existing behavior.

---

## Related Specs

- [Frontend Component Guidelines](../frontend/component-guidelines.md) - React component patterns
- [Frontend Hook Guidelines](../frontend/hook-guidelines.md) - Custom hooks for WebSocket
- [Error Handling](./error-handling.md) - WebSocket error handling patterns
