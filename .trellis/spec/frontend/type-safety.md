# Type Safety

> Type safety patterns in this project.

---

## Overview

This project uses **TypeScript** with strict mode enabled. Types are organized in shared directories and feature-specific locations.

**TypeScript Config**:
- `strict: true` - All strict checks enabled
- `noEmit: true` - Type checking only (Vite handles compilation)
- `jsx: "react-jsx"` - Modern JSX transform

---

## Type Organization

### Shared Types

Place shared types in `src/types/`:

```
src/types/
├── app.ts              # Core app types (Project, Session, etc.)
├── sharedTypes.ts      # Types shared with backend
├── global.d.ts         # Global type declarations
└── *.d.ts              # Third-party library type declarations
```

### Feature-Specific Types

Place feature types in `src/components/<feature>/types/`:

```
src/components/sidebar/types/
└── index.ts            # Sidebar-specific types
```

### Type Definitions

Use `type` (not `interface`) for all type definitions:

```tsx
// ✅ Correct
type User = {
  id: string;
  username: string;
};

type ComponentProps = {
  user: User;
  onUpdate: (user: User) => void;
};

// ❌ Wrong
interface User {
  id: string;
  username: string;
}
```

**Why `type` over `interface`?**
- Consistent with project conventions
- More flexible (unions, intersections, mapped types)
- Simpler mental model

---

## Validation

### No Runtime Validation Library

This project **does not use** Zod, Yup, or similar libraries.

**Validation approach**:
- TypeScript for compile-time type safety
- Manual runtime checks where needed
- Backend validates all user input

```tsx
// Manual validation example
function validateUser(data: unknown): data is User {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'username' in data &&
    typeof data.id === 'string' &&
    typeof data.username === 'string'
  );
}
```

---

## Common Patterns

### Type-Only Imports

Use `type` keyword for type-only imports:

```tsx
// ✅ Correct
import type { Project } from '../types/app';
import type { TFunction } from 'i18next';

// ❌ Wrong
import { Project } from '../types/app';  // Runtime import
```

### Union Types

Use union types for variants:

```tsx
type SessionProvider = 'claude' | 'cursor' | 'codex' | 'gemini';
type AppTab = 'chat' | 'files' | 'shell' | 'git' | 'tasks' | 'preview';
```

### Optional Properties

Use `?` for optional properties:

```tsx
type ProjectSession = {
  id: string;
  title?: string;          // Optional
  summary?: string;        // Optional
  createdAt?: string;      // Optional
};
```

### Index Signatures

Use index signatures for dynamic keys:

```tsx
type Project = {
  name: string;
  displayName: string;
  [key: string]: unknown;  // Allow additional properties
};
```

### Generic Types

Use generics for reusable types:

```tsx
type ApiResponse<T> = {
  data: T;
  error?: string;
};

type ProjectsResponse = ApiResponse<Project[]>;
```

---

## Forbidden Patterns

### ❌ Don't Do This

1. **Don't use `any`**
   ```tsx
   ❌ const data: any = fetchData();
   ✅ const data: Project[] = fetchData();
   ✅ const data: unknown = fetchData();  // If type is truly unknown
   ```

2. **Don't use `interface`**
   ```tsx
   ❌ interface Props { ... }
   ✅ type Props = { ... }
   ```

3. **Don't use type assertions without reason**
   ```tsx
   ❌ const data = response.json() as Project[];  // Unsafe
   ✅ const data = await response.json() as Project[];  // OK if backend contract is known
   ```

4. **Don't ignore TypeScript errors**
   ```tsx
   ❌ // @ts-ignore
      const value = data.unknownProperty;
   ✅ const value = 'unknownProperty' in data ? data.unknownProperty : undefined;
   ```

5. **Don't use non-null assertion without reason**
   ```tsx
   ❌ const user = users.find(u => u.id === id)!;  // Might be undefined
   ✅ const user = users.find(u => u.id === id);
      if (!user) return;
   ```

---

## Examples from Codebase

### App Types

**File**: `src/types/app.ts`

```tsx
export type SessionProvider = 'claude' | 'cursor' | 'codex' | 'gemini';

export type AppTab = 'chat' | 'files' | 'shell' | 'git' | 'tasks' | 'preview';

export interface ProjectSession {
  id: string;
  title?: string;
  summary?: string;
  createdAt?: string;
  __provider?: SessionProvider;
  __projectName?: string;
  [key: string]: unknown;
}

export interface Project {
  name: string;
  displayName: string;
  fullPath: string;
  sessions?: ProjectSession[];
  [key: string]: unknown;
}
```

### Component Props

```tsx
type SidebarContentProps = {
  isPWA: boolean;
  isMobile: boolean;
  projects: Project[];
  searchFilter: string;
  onSearchFilterChange: (value: string) => void;
  t: TFunction;
};
```
