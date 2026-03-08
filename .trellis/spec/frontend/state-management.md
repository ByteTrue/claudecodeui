# State Management

> How state is managed in this project.

---

## Overview

This project uses **React Context + hooks** for state management. No external state management library (Redux, Zustand, etc.) is used.

**State Categories**:
- **Local State**: `useState`, `useReducer` in components/hooks
- **Global State**: React Context providers
- **Server State**: Custom hooks with `fetch` API (no React Query/SWR)
- **URL State**: React Router params and query strings

---

## State Categories

### Local State

Use `useState` or `useReducer` for component-specific state:

```tsx
// Simple state
const [isOpen, setIsOpen] = useState(false);

// Complex state
const [state, dispatch] = useReducer(reducer, initialState);
```

**When to use**:
- ✅ State used only in one component
- ✅ UI state (modals, dropdowns, form inputs)
- ✅ Temporary state (loading, error)

### Global State (Context)

Use React Context for app-wide state:

```tsx
// src/contexts/ThemeContext.jsx
export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

**Existing Contexts**:
- `AuthContext` - User authentication state
- `ThemeContext` - Theme (light/dark mode)
- `WebSocketContext` - WebSocket connection
- `TaskMasterContext` - TaskMaster integration
- `TasksSettingsContext` - Tasks settings

**When to use**:
- ✅ State needed by many components
- ✅ User preferences (theme, language)
- ✅ Authentication state
- ✅ WebSocket connections

### Server State

Use custom hooks with `fetch` API:

```tsx
export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    const response = await api.projects();
    const data = await response.json();
    setProjects(data);
  }, []);

  useEffect(() => {
    void fetchProjects();
  }, [fetchProjects]);

  return { projects, isLoading, refetch: fetchProjects };
}
```

**No caching library** - data is refetched on demand.

### URL State

Use React Router for URL-based state:

```tsx
// Reading URL params
const { sessionId } = useParams();

// Navigating
const navigate = useNavigate();
navigate(`/session/${sessionId}`);
```

---

## When to Use Global State

Promote state to global (Context) when:

- ✅ 3+ unrelated components need the same state
- ✅ State represents app-wide concerns (auth, theme, i18n)
- ✅ Prop drilling becomes painful (5+ levels deep)

Keep state local when:

- ✅ Only 1-2 components need it
- ✅ State is temporary or UI-specific
- ✅ Prop drilling is manageable (2-3 levels)

---

## Server State

### No Caching Library

This project **does not use** React Query, SWR, or similar libraries.

**Data fetching pattern**:
1. Custom hook with `useState` + `useEffect`
2. Fetch data with `api` utility
3. Store in local state
4. Refetch on demand

**Example**: `src/hooks/useProjectsState.ts`

### Real-Time Updates

Use WebSocket for real-time updates:

```tsx
// WebSocketContext provides connection
const { latestMessage } = useContext(WebSocketContext);

useEffect(() => {
  if (latestMessage?.type === 'projects_updated') {
    setProjects(latestMessage.projects);
  }
}, [latestMessage]);
```

---

## Common Mistakes

### ❌ Don't Do This

1. **Don't overuse Context**
   ```tsx
   ❌ Create Context for every piece of state
   ✅ Use Context only for truly global state
   ```

2. **Don't put everything in one Context**
   ```tsx
   ❌ <AppContext> with 20+ values
   ✅ Split into focused contexts (AuthContext, ThemeContext, etc.)
   ```

3. **Don't forget to memoize Context values**
   ```tsx
   ❌ <Context.Provider value={{ user, setUser }}>  // New object every render
   ✅ const value = useMemo(() => ({ user, setUser }), [user]);
      <Context.Provider value={value}>
   ```

4. **Don't use Context for high-frequency updates**
   ```tsx
   ❌ Mouse position in Context (causes re-renders)
   ✅ Use local state or refs
   ```

---

## Examples from Codebase

### Theme Context

**File**: `src/contexts/ThemeContext.jsx`

```jsx
export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

### WebSocket Context

**File**: `src/contexts/WebSocketContext.tsx`

```tsx
export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [latestMessage, setLatestMessage] = useState<AppSocketMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setLatestMessage(message);
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ latestMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
}
```
