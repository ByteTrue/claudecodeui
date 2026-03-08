# Directory Structure

> How frontend code is organized in this project.

---

## Overview

This project uses a **feature-based organization** with clear separation between components, hooks, contexts, and utilities. The frontend is built with React 18 + Vite + TypeScript + Tailwind CSS.

---

## Directory Layout

```
src/
├── components/          # React components (feature-based organization)
│   ├── sidebar/
│   │   ├── view/       # UI components
│   │   ├── hooks/      # Feature-specific hooks
│   │   ├── types/      # Feature-specific types
│   │   └── utils/      # Feature-specific utilities
│   ├── settings/
│   │   ├── view/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── constants/
│   └── ...
├── contexts/            # React Context providers (global state)
├── hooks/               # Shared custom hooks
├── types/               # Shared TypeScript type definitions
├── utils/               # Shared utility functions
├── lib/                 # Third-party library wrappers
├── i18n/                # Internationalization (i18next)
├── constants/           # Global constants
├── shared/              # Code shared between client and server
├── App.tsx              # Root component
├── main.jsx             # Entry point
└── index.css            # Global styles (Tailwind)
```

---

## Module Organization

### Feature-Based Components

Large features are organized as **self-contained modules** with their own subdirectories:

```
components/
└── feature-name/
    ├── view/              # UI components
    │   ├── FeatureName.tsx           # Main component
    │   └── subcomponents/            # Child components
    │       ├── SubComponent1.tsx
    │       └── SubComponent2.tsx
    ├── hooks/             # Feature-specific hooks
    │   └── useFeatureController.ts
    ├── types/             # Feature-specific types
    │   └── index.ts
    ├── utils/             # Feature-specific utilities
    │   └── helpers.ts
    └── constants/         # Feature-specific constants
        └── index.ts
```

**Examples**:
- `src/components/sidebar/` - Sidebar feature with view, hooks, types, utils
- `src/components/settings/` - Settings feature with view, hooks, types, constants

### Simple Components

Small, reusable components can be placed directly in `components/`:

```
components/
├── llm-logo-provider/
│   ├── ClaudeLogo.tsx
│   ├── CursorLogo.tsx
│   └── ...
└── provider-auth/
    └── view/
        └── ProviderLoginModal.tsx
```

---

## Naming Conventions

### Files

| Type | Convention | Example |
|------|------------|---------|
| React Components | PascalCase | `SidebarContent.tsx` |
| Hooks | camelCase with `use` prefix | `useUiPreferences.ts` |
| Types | PascalCase | `app.ts`, `sharedTypes.ts` |
| Utilities | camelCase | `helpers.ts`, `utils.js` |
| Constants | camelCase or UPPER_SNAKE_CASE | `constants.ts`, `modelConstants.js` |

### Directories

- Use **kebab-case** for multi-word directories: `llm-logo-provider/`
- Use **camelCase** for single-word directories: `components/`, `hooks/`

---

## Shared Code

### `shared/` Directory

Code that is used by **both client and server** goes in `shared/`:

```
shared/
└── modelConstants.js    # Model configurations used by both frontend and backend
```

**Rule**: Only put code here if it's genuinely shared. Don't use it as a dumping ground.

---

## Import Patterns

### Absolute vs Relative Imports

Use **relative imports** for all imports (no path aliases configured):

```tsx
// ✅ Correct
import { ScrollArea } from '../../../../shared/view/ui';
import type { Project } from '../../../../types/app';
import SidebarFooter from './SidebarFooter';

// ❌ Wrong (no path aliases configured)
import { ScrollArea } from '@/shared/view/ui';
import type { Project } from '@/types/app';
```

### Import Order

Follow ESLint's `import-x/order` rule:

1. Built-in modules (Node.js)
2. External packages (npm)
3. Internal modules (project code)
4. Parent directory imports
5. Sibling imports
6. Index imports

**No blank lines between groups** (enforced by ESLint).

**Example**:
```tsx
import { type ReactNode } from 'react';
import { Folder, MessageSquare, Search } from 'lucide-react';
import type { TFunction } from 'i18next';
import { ScrollArea } from '../../../../shared/view/ui';
import type { Project } from '../../../../types/app';
import SidebarFooter from './SidebarFooter';
```

---

## Examples

### Well-Organized Features

| Feature | Path | Structure |
|---------|------|-----------|
| Sidebar | `src/components/sidebar/` | ✅ Has view/, hooks/, types/, utils/ |
| Settings | `src/components/settings/` | ✅ Has view/, hooks/, types/, constants/ |

### Shared Resources

| Resource | Path | Purpose |
|----------|------|---------|
| Custom Hooks | `src/hooks/` | Hooks used across multiple features |
| Type Definitions | `src/types/` | Shared TypeScript types |
| Utilities | `src/utils/` | Shared utility functions |
| Contexts | `src/contexts/` | Global state providers |

---

## Anti-Patterns

### ❌ Don't Do This

1. **Don't create flat component directories**
   ```
   ❌ components/
      ├── SidebarContent.tsx
      ├── SidebarHeader.tsx
      ├── SidebarFooter.tsx
      ├── SidebarProjectList.tsx
      └── ... (50 more files)
   ```

2. **Don't mix feature code with shared code**
   ```
   ❌ utils/
      ├── sidebarHelpers.ts    # Should be in components/sidebar/utils/
      ├── settingsHelpers.ts   # Should be in components/settings/utils/
      └── formatDate.ts        # ✅ This is fine (truly shared)
   ```

3. **Don't create unnecessary nesting**
   ```
   ❌ components/
      └── ui/
          └── buttons/
              └── primary/
                  └── large/
                      └── Button.tsx
   ```

---

## When to Create a New Feature Directory

Create a feature directory when:

- ✅ The feature has 3+ related components
- ✅ The feature has its own hooks or utilities
- ✅ The feature has complex types or constants
- ✅ The feature is logically independent

Keep it simple when:

- ✅ It's a single, small component
- ✅ It's a pure UI component with no logic
- ✅ It's used in only one place
