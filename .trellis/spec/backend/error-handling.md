# Error Handling

> Error handling patterns in this project.

---

## Overview

This project uses **try-catch** blocks for error handling. Errors are logged to console and returned as JSON responses.

---

## Error Types

No custom error classes. Standard JavaScript errors are used.

---

## Error Handling Patterns

```js
router.post('/login', async (req, res) => {
  try {
    // Validation
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Business logic
    const user = userDb.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Success
    res.json({ success: true, user });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

---

## API Error Responses

```js
// Error response
res.status(400).json({ error: 'Error message' });

// Success response
res.json({ success: true, data: { ... } });
```

**HTTP Status Codes**:
- 200: Success
- 400: Bad request
- 401: Unauthorized
- 403: Forbidden
- 500: Internal server error

---

## Common Mistakes

### ❌ Don't Do This

1. **Don't expose sensitive error details**
   ```js
   ❌ res.status(500).json({ error: error.message });
   ✅ res.status(500).json({ error: 'Internal server error' });
   ```

2. **Don't forget to log errors**
   ```js
   ❌ catch (error) { res.status(500).json({ error: '...' }); }
   ✅ catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: '...' });
      }
   ```
