# Hook Guidelines

> How hooks are used in this project.

---

## Overview

This project uses **custom hooks** extensively to encapsulate stateful logic and side effects. Hooks follow React's rules and naming conventions.

**No external data fetching library** is used (no React Query, SWR, etc.). Data fetching is done with native `fetch` API wrapped in custom hooks.

---

## Custom Hook Patterns

### Standard Hook Structure

```tsx
import { useCallback, useEffect, useState } from 'react';

type UseFeatureArgs = {
  initialValue: string;
  onUpdate?: (value: string) => void;
};

export function useFeature({ initialValue, onUpdate }: UseFeatureArgs) {
  // 1. State declarations
  const [value, setValue] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);

  // 2. Memoized callbacks
  const handleUpdate = useCallback((newValue: string) => {
    setValue(newValue);
    onUpdate?.(newValue);
  }, [onUpdate]);

  // 3. Effects
  useEffect(() => {
    // Side effects
  }, [value]);

  // 4. Return object
  return {
    value,
    isLoading,
    handleUpdate,
  };
}
```

**Key Points**:
- ✅ Use `type` for hook arguments (not `interface`)
- ✅ Name hooks with `use` prefix
- ✅ Return an object (not array) for multiple values
- ✅ Use `useCallback` for returned functions
- ✅ Use `useMemo` for expensive computations

---

## Naming Conventions

### Hook Names

| Pattern | Example | Purpose |
|---------|---------|---------|
| `use<Feature>` | `useUiPreferences` | Feature-specific logic |
| `use<Feature>State` | `useProjectsState` | Complex state management |
| `use<Feature>Controller` | `useSidebarController` | Controller pattern (logic + handlers) |

### File Names

- Hook files use **camelCase**: `useUiPreferences.ts`
- Place in `src/hooks/` for shared hooks
- Place in `src/components/<feature>/hooks/` for feature-specific hooks

---

## Data Fetching

### No External Library

This project **does not use** React Query, SWR, or similar libraries. Data fetching is done with:

1. Native `fetch` API
2. Wrapped in `api` utility (`src/utils/api.ts`)
3. Called from custom hooks

### Data Fetching Pattern

```tsx
import { useCallback, useEffect, useState } from 'react';
import { api } from '../utils/api';
import type { Project } from '../types/app';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.projects();
      const data = await response.json() as Project[];
      setProjects(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProjects();
  }, [fetchProjects]);

  return {
    projects,
    isLoading,
    error,
    refetch: fetchProjects,
  };
}
```

**Key Points**:
- ✅ Use `try/catch/finally` for error handling
- ✅ Set loading state before and after fetch
- ✅ Return `refetch` function for manual refresh
- ✅ Use `void` for fire-and-forget async calls in `useEffect`

---

## State Management Patterns

### useReducer for Complex State

Use `useReducer` for complex state logic:

```tsx
import { useReducer } from 'react';

type State = {
  autoExpandTools: boolean;
  showRawParameters: boolean;
  showThinking: boolean;
};

type Action =
  | { type: 'set'; key: keyof State; value: boolean }
  | { type: 'reset'; value?: Partial<State> };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'set':
      return { ...state, [action.key]: action.value };
    case 'reset':
      return { ...DEFAULTS, ...(action.value || {}) };
    default:
      return state;
  }
}

export function useUiPreferences() {
  const [state, dispatch] = useReducer(reducer, DEFAULTS);

  const setPreference = (key: keyof State, value: boolean) => {
    dispatch({ type: 'set', key, value });
  };

  return {
    preferences: state,
    setPreference,
  };
}
```

**Example from codebase**: `src/hooks/useUiPreferences.ts`

### useState for Simple State

Use `useState` for simple state:

```tsx
const [isOpen, setIsOpen] = useState(false);
const [count, setCount] = useState(0);
```

---

## useCallback and useMemo

### When to Use useCallback

Use `useCallback` for:

1. **Functions passed as props** to child components
2. **Functions used in dependency arrays** of other hooks
3. **Event handlers** returned from hooks

```tsx
export function useProjectsState({ navigate }: Args) {
  const handleProjectSelect = useCallback(
    (project: Project) => {
      setSelectedProject(project);
      navigate('/');
    },
    [navigate],  // Dependencies
  );

  return { handleProjectSelect };
}
```

### When to Use useMemo

Use `useMemo` for:

1. **Expensive computations**
2. **Object/array references** passed as props

```tsx
const sidebarSharedProps = useMemo(
  () => ({
    projects,
    selectedProject,
    onProjectSelect: handleProjectSelect,
    onSessionSelect: handleSessionSelect,
  }),
  [projects, selectedProject, handleProjectSelect, handleSessionSelect],
);
```

**Example from codebase**: `src/hooks/useProjectsState.ts:491-526`

---

## useEffect Patterns

### Cleanup Functions

Always return cleanup function when needed:

```tsx
useEffect(() => {
  const timeoutId = setTimeout(() => {
    setLoadingProgress(null);
  }, 500);

  return () => {
    clearTimeout(timeoutId);
  };
}, []);
```

### Dependency Arrays

- ✅ Include all dependencies (enforced by ESLint)
- ✅ Use empty array `[]` for mount-only effects
- ✅ Omit array for effects that run on every render (rare)

```tsx
// Run once on mount
useEffect(() => {
  void fetchProjects();
}, [fetchProjects]);

// Run when value changes
useEffect(() => {
  localStorage.setItem('key', value);
}, [value]);
```

### Async Effects

Use `void` for fire-and-forget async calls:

```tsx
useEffect(() => {
  void fetchProjects();  // ✅ Correct
}, [fetchProjects]);

// ❌ Wrong
useEffect(async () => {
  await fetchProjects();  // useEffect cannot be async
}, [fetchProjects]);
```

---

## Common Mistakes

### ❌ Don't Do This

1. **Don't call hooks conditionally**
   ```tsx
   ❌ if (condition) {
        const value = useHook();
      }
   ✅ const value = useHook();
      if (condition) { /* use value */ }
   ```

2. **Don't forget dependencies**
   ```tsx
   ❌ useEffect(() => {
        doSomething(value);
      }, []);  // Missing 'value' dependency
   ✅ useEffect(() => {
        doSomething(value);
      }, [value]);
   ```

3. **Don't use async useEffect directly**
   ```tsx
   ❌ useEffect(async () => { await fetch(); }, []);
   ✅ useEffect(() => { void fetch(); }, []);
   ```

4. **Don't return arrays from hooks (use objects)**
   ```tsx
   ❌ return [value, setValue];
   ✅ return { value, setValue };
   ```

5. **Don't create new objects/functions in dependency arrays**
   ```tsx
   ❌ useEffect(() => {}, [{ key: 'value' }]);  // New object every render
   ✅ const obj = useMemo(() => ({ key: 'value' }), []);
      useEffect(() => {}, [obj]);
   ```

---

## Examples from Codebase

### Complex State Hook

**File**: `src/hooks/useProjectsState.ts`

```tsx
export function useProjectsState({
  sessionId,
  navigate,
  latestMessage,
}: UseProjectsStateArgs) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);

  const fetchProjects = useCallback(async () => {
    try {
      setIsLoadingProjects(true);
      const response = await api.projects();
      const projectData = await response.json() as Project[];
      setProjects(projectData);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setIsLoadingProjects(false);
    }
  }, []);

  const handleProjectSelect = useCallback(
    (project: Project) => {
      setSelectedProject(project);
      navigate('/');
    },
    [navigate],
  );

  return {
    projects,
    selectedProject,
    isLoadingProjects,
    fetchProjects,
    handleProjectSelect,
  };
}
```

### Preferences Hook with useReducer

**File**: `src/hooks/useUiPreferences.ts`

```tsx
export function useUiPreferences(storageKey = 'uiPreferences') {
  const [state, dispatch] = useReducer(reducer, storageKey, readInitialPreferences);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state, storageKey]);

  const setPreference = (key: UiPreferenceKey, value: unknown) => {
    dispatch({ type: 'set', key, value });
  };

  return {
    preferences: state,
    setPreference,
  };
}
```
