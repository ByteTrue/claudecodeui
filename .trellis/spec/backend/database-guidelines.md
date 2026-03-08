# Database Guidelines

> Database patterns and conventions in this project.

---

## Overview

This project uses **SQLite** with **better-sqlite3** (synchronous API). Database operations are encapsulated in `server/database/db.js`.

**Key Points**:
- SQLite database (single file)
- better-sqlite3 (synchronous, not async)
- Prepared statements for all queries
- Manual migrations (no ORM)

---

## Query Patterns

### Prepared Statements

Always use prepared statements:

```js
// ✅ Correct
const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
const user = stmt.get(username);

// ❌ Wrong (SQL injection risk)
const user = db.prepare(`SELECT * FROM users WHERE username = '${username}'`).get();
```

### CRUD Operations

```js
// SELECT (single row)
const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

// SELECT (multiple rows)
const users = db.prepare('SELECT * FROM users WHERE is_active = 1').all();

// INSERT
const stmt = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)');
const result = stmt.run(username, passwordHash);
const newId = result.lastInsertRowid;

// UPDATE
db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(userId);

// DELETE
db.prepare('DELETE FROM api_keys WHERE id = ? AND user_id = ?').run(apiKeyId, userId);
```

---

## Migrations

### Manual Migrations

Migrations are run in `runMigrations()` function:

```js
const runMigrations = () => {
  try {
    const tableInfo = db.prepare("PRAGMA table_info(users)").all();
    const columnNames = tableInfo.map(col => col.name);

    if (!columnNames.includes('git_name')) {
      console.log('Running migration: Adding git_name column');
      db.exec('ALTER TABLE users ADD COLUMN git_name TEXT');
    }
  } catch (error) {
    console.error('Error running migrations:', error.message);
    throw error;
  }
};
```

---

## Naming Conventions

- **Tables**: snake_case (e.g., `users`, `api_keys`, `session_names`)
- **Columns**: snake_case (e.g., `user_id`, `created_at`, `is_active`)
- **Indexes**: `idx_<table>_<column>` (e.g., `idx_session_names_lookup`)

---

## Common Mistakes

### ❌ Don't Do This

1. **Don't use string interpolation**
   ```js
   ❌ db.prepare(`SELECT * FROM users WHERE id = ${userId}`).get();
   ✅ db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
   ```

2. **Don't use async/await with better-sqlite3**
   ```js
   ❌ const user = await db.prepare('SELECT ...').get();
   ✅ const user = db.prepare('SELECT ...').get();
   ```
