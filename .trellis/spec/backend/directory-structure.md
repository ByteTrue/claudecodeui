# Directory Structure

> How backend code is organized in this project.

---

## Overview

This project uses **Express.js** with **ES modules** (not CommonJS). The backend is organized by feature with clear separation of concerns.

**Tech Stack**:
- Express.js (REST API)
- better-sqlite3 (SQLite database)
- Node.js ES modules (`type: "module"`)

---

## Directory Layout

```
server/
├── routes/              # API route handlers (Express routers)
│   ├── auth.js         # Authentication endpoints
│   ├── projects.js     # Project management
│   ├── git.js          # Git operations
│   ├── user.js         # User management
│   └── ...
├── database/            # Database layer
│   ├── db.js           # Database connection and operations
│   └── init.sql        # Database schema
├── middleware/          # Express middleware
│   └── auth.js         # JWT authentication middleware
├── utils/               # Utility functions
│   ├── commandParser.js
│   ├── gitConfig.js
│   └── ...
├── constants/           # Constants and configuration
│   └── config.js
├── index.js             # Main server entry point
├── cli.js               # CLI entry point
└── projects.js          # Project management logic

shared/                  # Code shared between client and server
└── modelConstants.js
```

---

## Module Organization

### Routes (API Endpoints)

Each route file exports an Express router:

```js
import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Define routes
router.get('/status', async (req, res) => {
  // Handler logic
});

router.post('/login', authenticateToken, async (req, res) => {
  // Handler logic
});

export default router;
```

**Conventions**:
- One router per feature/resource
- Use middleware for authentication
- Export router as default

### Database Layer

Database operations are encapsulated in `database/db.js`:

```js
const userDb = {
  hasUsers: () => { /* ... */ },
  createUser: (username, passwordHash) => { /* ... */ },
  getUserByUsername: (username) => { /* ... */ },
};

export { db, userDb, apiKeysDb, credentialsDb };
```

**Conventions**:
- Group related operations in objects
- Export named objects (not default)
- Use better-sqlite3 prepared statements

### Utilities

Utility functions go in `server/utils/`:

```js
// utils/gitConfig.js
export function parseGitConfig(configText) {
  // Implementation
}
```

**Conventions**:
- Named exports (not default)
- Pure functions when possible
- Single responsibility

---

## Naming Conventions

### Files

| Type | Convention | Example |
|------|------------|---------|
| Routes | kebab-case | `auth.js`, `cli-auth.js` |
| Utilities | camelCase | `commandParser.js`, `gitConfig.js` |
| Database | kebab-case | `db.js`, `init.sql` |
| Main files | camelCase | `index.js`, `projects.js` |

### Functions

- Use **camelCase** for function names
- Use descriptive names: `validateWorkspacePath`, `sanitizeGitError`

### Constants

- Use **UPPER_SNAKE_CASE** for constants: `WORKSPACES_ROOT`, `FORBIDDEN_PATHS`

---

## ES Modules

This project uses **ES modules** (not CommonJS):

```js
// ✅ Correct (ES modules)
import express from 'express';
import { userDb } from '../database/db.js';
export default router;
export { validateWorkspacePath };

// ❌ Wrong (CommonJS)
const express = require('express');
const { userDb } = require('../database/db');
module.exports = router;
```

**Important**:
- Always include `.js` extension in imports
- Use `import`/`export` (not `require`/`module.exports`)
- `package.json` has `"type": "module"`

---

## Examples

### Route Handler

**File**: `server/routes/auth.js`

```js
import express from 'express';
import bcrypt from 'bcrypt';
import { userDb } from '../database/db.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = userDb.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = generateToken(user);
    res.json({ success: true, user: { id: user.id, username: user.username }, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
```

### Database Operations

**File**: `server/database/db.js`

```js
const userDb = {
  getUserByUsername: (username) => {
    try {
      const row = db.prepare('SELECT * FROM users WHERE username = ? AND is_active = 1').get(username);
      return row;
    } catch (err) {
      throw err;
    }
  },

  createUser: (username, passwordHash) => {
    try {
      const stmt = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)');
      const result = stmt.run(username, passwordHash);
      return { id: result.lastInsertRowid, username };
    } catch (err) {
      throw err;
    }
  },
};

export { userDb };
```
