const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { JWT_SECRET, authenticateToken } = require('../middleware/auth');
const pool = require('../config/database');
const { verifyPassword } = require('../services/passwords');

async function findDbUser(email, password) {
  const r = await pool.query(
    'SELECT id, email, name, role, tenant_id, password_hash FROM users WHERE lower(email) = lower($1) LIMIT 1',
    [email]
  );
  if (!r.rows.length) return null;
  const u = r.rows[0];
  if (!u.password_hash || !(await verifyPassword(password, u.password_hash))) return null;
  return { id: u.id, email: u.email, name: u.name, role: u.role, tenantId: u.tenant_id };
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const user = await findDbUser(email, password);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user });
  } catch (e) {
    console.error('Login error:', e);
    res.status(503).json({ error: 'Authentication service unavailable' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, name, role, tenant_id AS "tenantId" FROM users WHERE id = $1 AND tenant_id = $2',
      [req.user.id, req.user.tenantId]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Current user error:', error);
    return res.status(503).json({ error: 'Authentication service unavailable' });
  }
});

// GET /api/auth/users  (commander only)
const { requireCommander } = require('../middleware/auth');
router.get('/users', authenticateToken, requireCommander, async (req, res) => {
  try {
    const r = await pool.query('SELECT id, email, name, role, created_at FROM users ORDER BY id ASC');
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
