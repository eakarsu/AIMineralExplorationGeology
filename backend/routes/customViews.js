// Custom Views routes - 4 specialized exploration visualizations
// Endpoints feed dashboards used by the CustomViewsPage / "Exploration Views"
// sidebar entry. They build on the existing 18-table schema and add lat/lng
// columns to drill_targets + geochem_samples (idempotent ALTER TABLE) so the
// AnomalyMap component can render real markers.

const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// ─── one-shot lat/lng bootstrap ────────────────────────────────────────────
// Idempotent: safe to call on every cold start. Adds columns if missing,
// then back-fills NULL rows with deterministic-ish coords near each row's
// property country centroid (falls back to global jitter).
const COUNTRY_CENTROIDS = {
  Canada:         [56.13, -106.35],
  Peru:           [-9.19, -75.02],
  Australia:      [-25.27, 133.78],
  Chile:          [-35.68, -71.54],
  DRC:            [-4.04, 21.76],
  Brazil:         [-14.24, -51.93],
  Mexico:         [23.63, -102.55],
  USA:            [39.83, -98.58],
  'South Africa': [-30.56, 22.94],
  Finland:        [61.92, 25.75],
  Argentina:      [-38.42, -63.62],
  Mongolia:       [46.86, 103.85],
  'Papua NG':     [-6.31, 143.95],
  Ghana:          [7.95, -1.03],
};

function jitter(seedStr) {
  // simple hash -> stable [-1.5, +1.5] offset
  let h = 0;
  for (let i = 0; i < seedStr.length; i++) h = ((h << 5) - h + seedStr.charCodeAt(i)) | 0;
  const a = ((h & 0xffff) / 0xffff) * 3 - 1.5;
  const b = (((h >>> 16) & 0xffff) / 0xffff) * 3 - 1.5;
  return [a, b];
}

let _bootstrapDone = false;
async function ensureLatLng() {
  if (_bootstrapDone) return;
  try {
    await pool.query(`ALTER TABLE drill_targets   ADD COLUMN IF NOT EXISTS lat NUMERIC(9,5)`);
    await pool.query(`ALTER TABLE drill_targets   ADD COLUMN IF NOT EXISTS lng NUMERIC(9,5)`);
    await pool.query(`ALTER TABLE geochem_samples ADD COLUMN IF NOT EXISTS lat NUMERIC(9,5)`);
    await pool.query(`ALTER TABLE geochem_samples ADD COLUMN IF NOT EXISTS lng NUMERIC(9,5)`);

    // Build a property_id -> country map
    const props = await pool.query(`SELECT property_id, country FROM properties`);
    const byProp = {};
    for (const p of props.rows) byProp[p.property_id] = p.country;

    for (const tbl of ['drill_targets', 'geochem_samples']) {
      const idCol = tbl === 'drill_targets' ? 'target_id' : 'sample_id';
      const rows = await pool.query(
        `SELECT id, ${idCol} AS code, property_id FROM ${tbl} WHERE lat IS NULL OR lng IS NULL`
      );
      for (const r of rows.rows) {
        const centroid = COUNTRY_CENTROIDS[byProp[r.property_id]] || [0, 0];
        const [dLat, dLng] = jitter(`${tbl}-${r.code || r.id}`);
        const lat = centroid[0] + dLat;
        const lng = centroid[1] + dLng;
        await pool.query(`UPDATE ${tbl} SET lat = $1, lng = $2 WHERE id = $3`, [lat, lng, r.id]);
      }
    }
    _bootstrapDone = true;
  } catch (e) {
    console.warn('[customViews] ensureLatLng failed:', e.message);
  }
}

// ─── 1. DRILL HOLE STRIP PLOT ──────────────────────────────────────────────
// Returns one entry per drill_hole with assay grade buckets so the
// DrillStripPlot component can render vertical stacked bars (low / mid /
// high / bonanza segments).
router.get('/drill-strip', async (req, res) => {
  try {
    const holes = await pool.query(`SELECT hole_id, property_id, depth_m FROM drill_holes ORDER BY hole_id`);
    const assays = await pool.query(
      `SELECT hole_id, element, value_ppm FROM assay_results WHERE hole_id IS NOT NULL`
    );

    const byHole = {};
    for (const h of holes.rows) {
      byHole[h.hole_id] = {
        hole_id: h.hole_id,
        property_id: h.property_id,
        depth_m: Number(h.depth_m) || 0,
        low: 0,
        mid: 0,
        high: 0,
        bonanza: 0,
        peak_ppm: 0,
        peak_element: null,
      };
    }
    for (const a of assays.rows) {
      const bucket = byHole[a.hole_id];
      if (!bucket) continue;
      const v = Number(a.value_ppm) || 0;
      const elem = String(a.element || '').toLowerCase();
      const isPrecious = elem === 'au' || elem === 'ag';
      // normalize grade scale: precious metals in ppm, base metals scaled by /1000
      const norm = isPrecious ? v : v / 1000;
      if (norm < 0.5) bucket.low += 1;
      else if (norm < 2) bucket.mid += 1;
      else if (norm < 10) bucket.high += 1;
      else bucket.bonanza += 1;
      if (v > bucket.peak_ppm) {
        bucket.peak_ppm = v;
        bucket.peak_element = a.element;
      }
    }
    const out = Object.values(byHole)
      .filter((r) => r.low + r.mid + r.high + r.bonanza > 0)
      .sort((a, b) => (b.high + b.bonanza) - (a.high + a.bonanza))
      .slice(0, 25);
    res.json(out);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── 2. ANOMALY CLUSTER MAP ────────────────────────────────────────────────
// Returns geo-located drill_targets + geochem_samples for react-leaflet.
router.get('/anomaly-map', async (req, res) => {
  try {
    await ensureLatLng();
    const t = await pool.query(
      `SELECT target_id, name, property_id, target_type, priority, status, lat, lng
         FROM drill_targets WHERE lat IS NOT NULL AND lng IS NOT NULL`
    );
    const g = await pool.query(
      `SELECT sample_id, property_id, type, location, status, lat, lng
         FROM geochem_samples WHERE lat IS NOT NULL AND lng IS NOT NULL`
    );
    res.json({
      drill_targets: t.rows.map((r) => ({
        id: r.target_id,
        name: r.name,
        property_id: r.property_id,
        target_type: r.target_type,
        priority: r.priority,
        status: r.status,
        lat: Number(r.lat),
        lng: Number(r.lng),
        kind: 'drill_target',
      })),
      geochem_samples: g.rows.map((r) => ({
        id: r.sample_id,
        property_id: r.property_id,
        type: r.type,
        location: r.location,
        status: r.status,
        lat: Number(r.lat),
        lng: Number(r.lng),
        kind: 'geochem_sample',
      })),
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── 3. RESOURCE ESTIMATE PYRAMID ──────────────────────────────────────────
// Aggregates ndp_resource_estimates by category. Pyramid order:
// Measured (widest base) > Indicated > Inferred (narrowest top).
router.get('/resource-pyramid', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT category, SUM(tonnes) AS tonnes, AVG(grade) AS grade, COUNT(*) AS deposits
         FROM ndp_resource_estimates
        WHERE category IS NOT NULL
        GROUP BY category`
    );
    const order = ['Measured', 'Indicated', 'Inferred'];
    const buckets = {};
    for (const row of r.rows) {
      // normalize category capitalization
      const key = String(row.category || '')
        .trim()
        .toLowerCase()
        .replace(/^./, (c) => c.toUpperCase());
      const slot = order.find((o) => o.toLowerCase() === key.toLowerCase());
      if (!slot) continue;
      buckets[slot] = {
        category: slot,
        tonnes: Number(row.tonnes) || 0,
        grade: Number(row.grade) || 0,
        deposits: Number(row.deposits) || 0,
      };
    }
    const out = order
      .map((cat) => buckets[cat] || { category: cat, tonnes: 0, grade: 0, deposits: 0 });
    res.json(out);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── 4. PERMIT STATUS GANTT ────────────────────────────────────────────────
// Returns one row per permit so the PermitGantt component can plot a
// horizontal bar from issued_at across a default 24-month duration.
router.get('/permit-gantt', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT permit_id, property_id, authority, type, status, issued_at
         FROM permits ORDER BY issued_at NULLS LAST`
    );
    const now = new Date();
    const out = r.rows.map((row) => {
      const issued = row.issued_at ? new Date(row.issued_at) : new Date(now);
      const issuedMs = issued.getTime();
      // Default permit lifecycle = 24 months for plotting.
      const durationMonths = 24;
      const endMs = issuedMs + durationMonths * 30 * 24 * 3600 * 1000;
      // Recharts horizontal bars need [offset, length] in days-since-epoch.
      // Days are convenient + small enough to render.
      const dayMs = 24 * 3600 * 1000;
      const issuedDay = Math.round(issuedMs / dayMs);
      const endDay = Math.round(endMs / dayMs);
      return {
        permit_id: row.permit_id,
        property_id: row.property_id,
        authority: row.authority,
        type: row.type,
        status: row.status,
        issued_at: row.issued_at,
        // Recharts stacked-range trick: render [start, length]
        range: [issuedDay, endDay - issuedDay],
        start_day: issuedDay,
        length_days: endDay - issuedDay,
        end_day: endDay,
        start_iso: new Date(issuedMs).toISOString().slice(0, 10),
        end_iso: new Date(endMs).toISOString().slice(0, 10),
      };
    });
    res.json(out);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
