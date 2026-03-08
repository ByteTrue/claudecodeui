# Logging Guidelines

> Logging patterns in this project.

---

## Overview

This project uses **console logging** (no external logging library).

**Log Levels**:
- `console.log()` - General information
- `console.warn()` - Warnings (non-fatal)
- `console.error()` - Errors

---

## Log Levels

### console.log() - Information

```js
console.log('Database initialized successfully');
console.log(`[INFO] App Installation: ${appInstallPath}`);
```

### console.warn() - Warnings

```js
console.warn('Failed to update last login:', err.message);
```

### console.error() - Errors

```js
console.error('Login error:', error);
```

---

## Structured Logging

No structured logging. Use descriptive messages:

```js
console.log('');
console.log('═'.repeat(60));
console.log(`[INFO] App Installation: ${appInstallPath}`);
console.log(`[INFO] Database: ${dbPath}`);
console.log('═'.repeat(60));
console.log('');
```

---

## What to Log

- ✅ Server startup information
- ✅ Database initialization
- ✅ Migration execution
- ✅ Errors with context
- ✅ Warnings for non-fatal issues

---

## What NOT to Log

- ❌ Passwords
- ❌ API keys/tokens
- ❌ User credentials
- ❌ Sensitive user data
