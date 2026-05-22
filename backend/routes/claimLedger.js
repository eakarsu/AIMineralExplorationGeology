// Immutable claim transfer / status ledger.
// Append-only: only GET (list/filter/by-claim) + POST (insert) are exposed.
// No PUT / DELETE — ledger entries are not editable.

const express = require('express');
const pool = require('../config/database');
const { requireWriter } = require('../middleware/auth');

const router = express.Router();

const FIELDS = [
  'ledger_id', 'claim_id', 'property_id', 'event_type',
  'from_party', 'to_party', 'prev_status', 'next_status',
  'effective_date', 'reference', 'recorded_by', 'notes',
];

// GET /api/claim-ledger — list all, newest first
router.get('/', async (req, res) => {
  try {
    const { claim_id, property_id, event_type } = req.query;
    const where = [];
    const params = [];
    if (claim_id)    { params.push(claim_id);    where.push(`claim_id = $${params.length}`); }
    if (property_id) { params.push(property_id); where.push(`property_id = $${params.length}`); }
    if (event_type)  { params.push(event_type);  where.push(`event_type = $${params.length}`); }
    const sql = `SELECT * FROM claim_ledger${where.length ? ' WHERE ' + where.join(' AND ') : ''} ORDER BY created_at DESC, id DESC LIMIT 500`;
    const r = await pool.query(sql, params);
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/claim-ledger/by-claim/:claim_id
router.get('/by-claim/:claim_id', async (req, res) => {
  try {
    const r = await pool.query(
      'SELECT * FROM claim_ledger WHERE claim_id = $1 ORDER BY created_at ASC, id ASC',
      [req.params.claim_id]
    );
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/claim-ledger/:id
router.get('/:id', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM claim_ledger WHERE id = $1', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'not found' });
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/claim-ledger — append a new ledger event
// Writers only. If a claim_id is given, optionally syncs claims.status when
// the body includes next_status.
router.post('/', requireWriter, async (req, res) => {
  try {
    const body = req.body || {};
    if (!body.claim_id)   return res.status(400).json({ error: 'claim_id is required' });
    if (!body.event_type) return res.status(400).json({ error: 'event_type is required' });
    const ledger_id = body.ledger_id || `LDG-${body.claim_id}-${Date.now()}`;
    const recordedBy = body.recorded_by || req.user?.email || 'unknown';

    const vals = FIELDS.map((f) => {
      if (f === 'ledger_id')   return ledger_id;
      if (f === 'recorded_by') return recordedBy;
      return body[f] ?? null;
    });
    const ph = FIELDS.map((_, i) => `$${i + 1}`).join(',');
    const r = await pool.query(
      `INSERT INTO claim_ledger (${FIELDS.join(',')}) VALUES (${ph}) RETURNING *`,
      vals
    );

    // Optionally roll claims.status forward when ledger event implies it.
    if (body.next_status) {
      try {
        await pool.query('UPDATE claims SET status = $1, updated_at = NOW() WHERE claim_id = $2', [body.next_status, body.claim_id]);
      } catch (_) { /* claim row may not exist; ledger is still recorded */ }
    }

    res.status(201).json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
