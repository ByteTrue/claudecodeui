# Quality Guidelines

> Code quality standards for backend development.

---

## Overview

Backend code follows **ES module** conventions with **Express.js** patterns.

---

## Forbidden Patterns

### ❌ Never Do This

1. **Don't use CommonJS**
   ```js
   ❌ const express = require('express');
   ❌ module.exports = router;
   ```

2. **Don't use SQL injection-prone queries**
   ```js
   ❌ db.prepare(`SELECT * FROM users WHERE id = ${userId}`).get();
   ```

3. **Don't expose sensitive data in errors**
   ```js
   ❌ res.status(500).json({ error: error.stack });
   ```

---

## Required Patterns

### ✅ Always Do This

1. **Use ES modules**
   ```js
   ✅ import express from 'express';
   ✅ export default router;
   ```

2. **Include .js extension in imports**
   ```js
   ✅ import { userDb } from '../database/db.js';
   ```

3. **Use try-catch in route handlers**
   ```js
   ✅ router.post('/login', async (req, res) => {
        try { /* ... */ }
        catch (error) { /* ... */ }
      });
   ```

4. **Use prepared statements**
   ```js
   ✅ db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
   ```

---

## Testing Requirements

**No automated testing** currently. Manual testing required:
- Test API endpoints with Postman/curl
- Test database operations
- Test error cases

---

## Code Review Checklist

- [ ] Uses ES modules (import/export)
- [ ] Includes .js extension in imports
- [ ] Uses try-catch in route handlers
- [ ] Uses prepared statements for SQL
- [ ] Logs errors with console.error
- [ ] Returns consistent error format
- [ ] No sensitive data in logs/responses
