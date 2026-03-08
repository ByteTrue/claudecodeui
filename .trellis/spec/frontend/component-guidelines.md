# Component Guidelines

> Patterns and conventions for React components in this project.

---

## Overview

This project uses **functional components** with TypeScript. Components follow a consistent structure with explicit prop types and clear separation of concerns.

---

## Component Structure

### Standard Component Pattern

```tsx
import { type ReactNode } from 'react';
import type { TFunction } from 'i18next';

// 1. Type definitions first
type ComponentProps = {
  title: string;
  isActive: boolean;
  onAction: () => void;
  children?: ReactNode;
  t: TFunction;
};

// 2. Component function with explicit return type
export default function ComponentName({
  title,
  isActive,
  onAction,
  children,
  t,
}: ComponentProps) {
  // 3. Component logic
  return (
    <div className="...">
      {/* JSX */}
    </div>
  );
}
```

**Key Points**:
- ✅ Props are **destructured in function signature**
- ✅ Type definitions use `type` (not `interface`)
- ✅ Export as `default` for main components
- ✅ Named exports for helper components

---

## Props Conventions

### Props Type Definition

Use `type` for props (not `interface`):

```tsx
// ✅ Correct
type SidebarContentProps = {
  isPWA: boolean;
  isMobile: boolean;
  projects: Project[];
  onRefresh: () => void;
  t: TFunction;
};

// ❌ Wrong
interface SidebarContentProps {
  isPWA: boolean;
  // ...
}
```

### Props Destructuring

Always destructure props in the function signature:

```tsx
// ✅ Correct
export default function Sidebar({
  isPWA,
  isMobile,
  projects,
  onRefresh,
  t,
}: SidebarContentProps) {
  // Use props directly
  return <div>{projects.length}</div>;
}

// ❌ Wrong
export default function Sidebar(props: SidebarContentProps) {
  return <div>{props.projects.length}</div>;
}
```

### Optional Props

Use `?` for optional props:

```tsx
type ComponentProps = {
  title: string;              // Required
  subtitle?: string;          // Optional
  onClose?: () => void;       // Optional callback
  children?: ReactNode;       // Optional children
};
```

### Callback Props

Use `on` prefix for event handlers:

```tsx
type ComponentProps = {
  onRefresh: () => void;
  onSearchFilterChange: (value: string) => void;
  onConversationResultClick: (projectName: string, sessionId: string) => void;
};
```

---

## Styling Patterns

### Tailwind CSS

Use Tailwind utility classes directly in JSX:

```tsx
<div className="flex h-full flex-col bg-background/80 backdrop-blur-sm md:w-72 md:select-none">
  <div className="text-center py-12 md:py-8 px-4">
    <h3 className="text-base font-medium text-foreground mb-2 md:mb-1">
      {t('search.noResults')}
    </h3>
  </div>
</div>
```

**Conventions**:
- ✅ Use responsive prefixes: `md:`, `lg:`
- ✅ Use semantic color tokens: `bg-background`, `text-foreground`, `text-muted-foreground`
- ✅ Use opacity modifiers: `bg-background/80`, `text-muted-foreground/60`
- ✅ Follow Tailwind class order (enforced by ESLint)

### Dynamic Classes

Use template literals for conditional classes:

```tsx
<div className={`rounded-md px-2 py-2 ${isActive ? 'bg-accent' : 'hover:bg-accent/50'}`}>
```

Or use `clsx` for complex conditions:

```tsx
import clsx from 'clsx';

<div className={clsx(
  'rounded-md px-2 py-2',
  isActive && 'bg-accent',
  !isActive && 'hover:bg-accent/50'
)}>
```

---

## Accessibility

### Semantic HTML

Use semantic HTML elements:

```tsx
// ✅ Good
<button onClick={handleClick}>Click me</button>
<nav>...</nav>
<main>...</main>

// ❌ Bad
<div onClick={handleClick}>Click me</div>
```

### ARIA Labels

Add ARIA labels for screen readers when needed:

```tsx
<button aria-label="Close dialog" onClick={onClose}>
  <X className="w-4 h-4" />
</button>
```

### Keyboard Navigation

Ensure interactive elements are keyboard accessible (buttons, links, etc. are accessible by default).

---

## Common Mistakes

### ❌ Don't Do This

1. **Don't use `interface` for props**
   ```tsx
   ❌ interface Props { ... }
   ✅ type Props = { ... }
   ```

2. **Don't use props object directly**
   ```tsx
   ❌ function Component(props: Props) { return <div>{props.title}</div>; }
   ✅ function Component({ title }: Props) { return <div>{title}</div>; }
   ```

3. **Don't use index as key**
   ```tsx
   ❌ {items.map((item, index) => <div key={index}>{item}</div>)}
   ✅ {items.map((item) => <div key={item.id}>{item}</div>)}
   ```

4. **Don't create unnecessary wrapper divs**
   ```tsx
   ❌ return <div><div><div>{content}</div></div></div>;
   ✅ return <>{content}</>;  // Use Fragment
   ```

5. **Don't inline complex logic in JSX**
   ```tsx
   ❌ <div>{data.filter(x => x.active).map(x => x.name).join(', ')}</div>
   ✅ const activeNames = data.filter(x => x.active).map(x => x.name).join(', ');
      return <div>{activeNames}</div>;
   ```

---

## Examples from Codebase

**File**: `src/components/sidebar/view/subcomponents/SidebarContent.tsx`

```tsx
type SidebarContentProps = {
  isPWA: boolean;
  isMobile: boolean;
  projects: Project[];
  searchFilter: string;
  onSearchFilterChange: (value: string) => void;
  onRefresh: () => void;
  t: TFunction;
};

export default function SidebarContent({
  isPWA,
  isMobile,
  projects,
  searchFilter,
  onSearchFilterChange,
  onRefresh,
  t,
}: SidebarContentProps) {
  return (
    <div className="flex h-full flex-col bg-background/80 backdrop-blur-sm md:w-72">
      <SidebarHeader {...headerProps} />
      <ScrollArea className="flex-1">
        <SidebarProjectList {...projectListProps} />
      </ScrollArea>
      <SidebarFooter {...footerProps} />
    </div>
  );
}
```
