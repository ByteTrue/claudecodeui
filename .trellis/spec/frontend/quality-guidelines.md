# Quality Guidelines

> Code quality standards for frontend development.

---

## Overview

This project enforces code quality through **ESLint**, **TypeScript**, and **code review**. No automated testing is currently in place.

**Quality Tools**:
- ESLint with TypeScript, React, Tailwind plugins
- TypeScript strict mode
- Husky + lint-staged for pre-commit checks

---

## Linting

### Running Lint

```bash
npm run lint          # Check for issues
npm run lint:fix      # Auto-fix issues
npm run typecheck     # TypeScript type checking
```

### Pre-Commit Hook

Lint-staged runs ESLint on staged files before commit:

```json
{
  "lint-staged": {
    "src/**/*.{ts,tsx,js,jsx}": "eslint"
  }
}
```

### ESLint Rules

**Key rules enforced**:
- `unused-imports/no-unused-imports`: Warn on unused imports
- `react-hooks/rules-of-hooks`: Error on hook violations
- `react-hooks/exhaustive-deps`: Warn on missing dependencies
- `import-x/order`: Warn on incorrect import order
- `tailwindcss/classnames-order`: Warn on incorrect Tailwind class order

**Disabled rules**:
- `@typescript-eslint/no-explicit-any`: Allowed (use sparingly)
- `no-case-declarations`: Allowed

---

## Forbidden Patterns

### ❌ Never Do This

1. **Don't use `interface` for types**
   ```tsx
   ❌ interface Props { ... }
   ✅ type Props = { ... }
   ```

2. **Don't use index as key**
   ```tsx
   ❌ {items.map((item, i) => <div key={i}>{item}</div>)}
   ✅ {items.map((item) => <div key={item.id}>{item}</div>)}
   ```

3. **Don't ignore ESLint warnings**
   ```tsx
   ❌ // eslint-disable-next-line
   ✅ Fix the issue or discuss with team
   ```

4. **Don't use `any` without reason**
   ```tsx
   ❌ const data: any = ...
   ✅ const data: Project[] = ...
   ✅ const data: unknown = ...  // If truly unknown
   ```

5. **Don't create unused imports**
   ```tsx
   ❌ import { useState, useEffect, useMemo } from 'react';  // Only using useState
   ✅ import { useState } from 'react';
   ```

---

## Required Patterns

### ✅ Always Do This

1. **Use `type` for all type definitions**
   ```tsx
   ✅ type Props = { ... }
   ✅ type State = { ... }
   ```

2. **Destructure props in function signature**
   ```tsx
   ✅ function Component({ title, onClose }: Props) { ... }
   ❌ function Component(props: Props) { ... }
   ```

3. **Use type-only imports**
   ```tsx
   ✅ import type { Project } from '../types/app';
   ```

4. **Follow import order**
   ```tsx
   // 1. Built-in
   // 2. External packages
   // 3. Internal modules
   // 4. Parent/sibling imports
   ```

5. **Use semantic HTML**
   ```tsx
   ✅ <button onClick={...}>Click</button>
   ❌ <div onClick={...}>Click</div>
   ```

---

## Testing Requirements

### Current State

**No automated testing** is currently in place.

**Manual testing required**:
- ✅ Test feature in browser before committing
- ✅ Test on mobile viewport (responsive design)
- ✅ Test light and dark themes
- ✅ Test with different providers (Claude, Cursor, etc.)

### Future Testing

When tests are added, follow these guidelines:
- Unit tests for utilities and hooks
- Integration tests for complex features
- E2E tests for critical user flows

---

## Code Review Checklist

### Before Submitting PR

- [ ] Code follows project conventions
- [ ] ESLint passes (`npm run lint`)
- [ ] TypeScript passes (`npm run typecheck`)
- [ ] Build succeeds (`npm run build`)
- [ ] Feature tested manually in browser
- [ ] No console errors or warnings
- [ ] Commit message follows convention

### Reviewer Checklist

- [ ] Code follows directory structure guidelines
- [ ] Components use correct patterns (props destructuring, etc.)
- [ ] Hooks follow naming conventions
- [ ] Types use `type` (not `interface`)
- [ ] No unused imports or variables
- [ ] Tailwind classes follow order
- [ ] No `any` without justification
- [ ] Semantic HTML used
- [ ] Responsive design considered

---

## Build and Deploy

### Build Command

```bash
npm run build
```

**Build output**: `dist/` directory

### Build Checks

Before deploying:
- ✅ Build succeeds without errors
- ✅ No TypeScript errors
- ✅ No ESLint errors
- ✅ Bundle size is reasonable

---

## Common Mistakes

### ❌ Mistakes to Avoid

1. **Forgetting to run lint before commit**
   - Pre-commit hook will catch this, but fix locally first

2. **Using `interface` instead of `type`**
   - Project convention is `type` everywhere

3. **Not testing on mobile**
   - This is a mobile-first app, always test responsive design

4. **Ignoring TypeScript errors**
   - Fix all TypeScript errors before committing

5. **Creating unnecessary files**
   - Don't create files unless they're needed

---

## Performance Considerations

### Bundle Size

- ✅ Use dynamic imports for large components
- ✅ Avoid importing entire libraries (import specific functions)
- ✅ Use production build for deployment

### React Performance

- ✅ Use `useCallback` for functions passed as props
- ✅ Use `useMemo` for expensive computations
- ✅ Avoid inline object/array creation in render
- ✅ Use `React.memo` for expensive components (sparingly)

---

## Accessibility

### Basic Requirements

- ✅ Use semantic HTML (`<button>`, `<nav>`, `<main>`)
- ✅ Add `aria-label` for icon-only buttons
- ✅ Ensure keyboard navigation works
- ✅ Test with screen reader (basic check)

### Color Contrast

- ✅ Use Tailwind's semantic color tokens
- ✅ Test both light and dark themes
- ✅ Ensure text is readable

---

## Examples

### Good Code

```tsx
import type { Project } from '../types/app';

type ProjectCardProps = {
  project: Project;
  onSelect: (project: Project) => void;
};

export default function ProjectCard({ project, onSelect }: ProjectCardProps) {
  const handleClick = () => {
    onSelect(project);
  };

  return (
    <button
      className="rounded-md px-4 py-2 hover:bg-accent"
      onClick={handleClick}
    >
      {project.displayName}
    </button>
  );
}
```

**Why it's good**:
- ✅ Uses `type` for props
- ✅ Props destructured in signature
- ✅ Type-only import
- ✅ Semantic HTML (`<button>`)
- ✅ Tailwind classes
- ✅ Named event handler
