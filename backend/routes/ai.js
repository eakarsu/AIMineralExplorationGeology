const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const ai = require('../services/ai');

async function record(feature, input, output) {
  try {
    await pool.query(
      'INSERT INTO ai_results (feature, input, output) VALUES ($1, $2, $3)',
      [feature, input || {}, output || {}]
    );
  } catch (e) {
    console.warn(`[ai] failed to record ${feature}:`, e.message);
  }
}

// ──────────────────────────────────────────────────────────────
// Sample fills — realistic exploration-geology scenarios.
// Keys here MUST match the field `key`s in the frontend AI*Page.js
// components so that "Sample Fill" buttons populate the form.
// ──────────────────────────────────────────────────────────────
const SAMPLES = {
  'anomaly-cluster': [
    { label: 'Default — cluster current geochem',  values: { context_notes: '' } },
    { label: 'Bias: Hawkeye Au district',         values: { context_notes: 'Bias clustering toward epithermal Au pathfinders (As, Sb, Hg) in the Hawkeye district; sericite-altered andesite host.' } },
    { label: 'Bias: porphyry Cu-Mo',              values: { context_notes: 'Bias clustering toward porphyry Cu-Mo pathfinders (Cu, Mo, Au, Re) at Atacama and Red Caribou.' } },
    { label: 'Bias: nickel sulphide',             values: { context_notes: 'Bias clustering toward magmatic Ni-Cu-PGE pathfinders (Ni, Cu, Pt, Pd, Co) at Lapland.' } },
    { label: 'Bias: REE carbonatite',             values: { context_notes: 'Bias clustering toward REE carbonatite pathfinders (Ce, La, Nd, Nb, F) at Gobi Rare Earth.' } },
  ],

  'drill-target-rank': [
    { label: 'Default — rank all current targets',  values: { budget_usd: 4500000 } },
    { label: '$2.5M Q3 program',                    values: { budget_usd: 2500000 } },
    { label: '$8M flagship campaign',               values: { budget_usd: 8000000 } },
    { label: '$1M opportunistic infill',            values: { budget_usd: 1000000 } },
    { label: '$15M aggressive growth',              values: { budget_usd: 15000000 } },
  ],

  'ndp-43-101-summary': [
    { label: 'Hawkeye Gold Project',     values: { property_id: 'PROP-CA-001' } },
    { label: 'Red Caribou Copper',       values: { property_id: 'PROP-CA-002' } },
    { label: 'Atacama Copper-Moly',      values: { property_id: 'PROP-CL-005' } },
    { label: 'Carajas Iron Ore',         values: { property_id: 'PROP-BR-007' } },
    { label: 'Bushveld PGE',             values: { property_id: 'PROP-ZA-010' } },
  ],

  'assay-trend': [
    { label: 'DDH-HAW-001 — gold trend',        values: { hole_id: 'DDH-HAW-001', element: 'Au' } },
    { label: 'DDH-ATC-001 — copper trend',      values: { hole_id: 'DDH-ATC-001', element: 'Cu' } },
    { label: 'DDH-LAP-001 — nickel trend',      values: { hole_id: 'DDH-LAP-001', element: 'Ni' } },
    { label: 'DDH-MBL-001 — lithium trend',     values: { hole_id: 'DDH-MBL-001', element: 'Li' } },
    { label: 'DDH-GOB-001 — REE trend',         values: { hole_id: 'DDH-GOB-001', element: 'REE' } },
  ],

  'executive-brief': [
    { label: 'Default snapshot',                values: { notes: '' } },
    { label: 'Bias: gold portfolio',            values: { notes: 'Bias the brief toward gold properties (Hawkeye, Ashanti, Battle Mountain) and capital allocation between them.' } },
    { label: 'Bias: battery metals',            values: { notes: 'Bias the brief toward battery metals (Marble Bar Li, Salta Li brine, Katanga Co, Lapland Ni).' } },
    { label: 'Bias: permitting risk',           values: { notes: 'Bias the brief toward permitting and jurisdictional risk (DRC, PNG, Argentina).' } },
    { label: 'Bias: discovery pipeline',        values: { notes: 'Bias the brief toward early-stage discovery and new target generation.' } },
  ],

  'permit-readiness': [
    { label: 'Hawkeye Gold (BC, Canada)',    values: { property_id: 'PROP-CA-001' } },
    { label: 'Cerro Verde (Peru)',           values: { property_id: 'PROP-PE-003' } },
    { label: 'Katanga Cobalt (DRC)',         values: { property_id: 'PROP-CD-006' } },
    { label: 'Salta Lithium Brine (Argentina)',values: { property_id: 'PROP-AR-012' } },
    { label: 'Highlands Cu-Au (PNG)',        values: { property_id: 'PROP-PG-014' } },
  ],

  'environmental-risk-brief': [
    { label: 'Katanga tailings precursor',   values: { property_id: 'PROP-CD-006' } },
    { label: 'Atacama wetland dust',         values: { property_id: 'PROP-CL-005' } },
    { label: 'Battle Mountain sage-grouse',  values: { property_id: 'PROP-NV-009' } },
    { label: 'Salta brine pond',             values: { property_id: 'PROP-AR-012' } },
    { label: 'Ashanti West galamsey overlap',values: { property_id: 'PROP-GH-015' } },
  ],

  'indigenous-engagement-plan': [
    {
      label: 'Tahltan — Hawkeye (BC)',
      values: { community: 'Tahltan Central Government', property_id: 'PROP-CA-001' },
    },
    {
      label: 'Nyamal — Marble Bar (AU)',
      values: { community: 'Nyamal People', property_id: 'PROP-AU-004' },
    },
    {
      label: 'Sami Parliament — Lapland (FI)',
      values: { community: 'Sami Parliament (Samediggi)', property_id: 'PROP-FI-011' },
    },
    {
      label: 'Western Shoshone — Battle Mountain (US)',
      values: { community: 'Western Shoshone', property_id: 'PROP-NV-009' },
    },
    {
      label: 'Likanantai — Atacama (CL)',
      values: { community: 'Likanantai community', property_id: 'PROP-CL-005' },
    },
  ],

  'vendor-quote-compare': [
    {
      label: 'Diamond drilling — Hawkeye 5,000m',
      values: {
        service: 'Diamond core drilling — Hawkeye Phase II, 5,000 m',
        quotes_text: 'Major Drilling: $12,500/day, mob $85,000, est 65 days. Boart Longyear: $11,800/day, mob $92,000, est 60 days. Foraco: $10,200/day, mob $78,000, est 72 days.',
      },
    },
    {
      label: 'Airborne EM — Red Caribou 1,200 line-km',
      values: {
        service: 'Airborne VTEM + magnetics — Red Caribou, 1,200 line-km',
        quotes_text: 'Geotech: $22,000/day, mob $140,000, est 6 days. Sander: $21,500/day, mob $135,000, est 7 days. Local Skyforce: $18,500/day, mob $95,000, est 9 days.',
      },
    },
    {
      label: 'Assay lab — 2,000 samples Au + multi-element',
      values: {
        service: '2,000 samples — Au by FA + 4-acid digest 35-element ICP-MS',
        quotes_text: 'ALS: $35/sample, 14-day TAT. SGS: $38/sample, 12-day TAT, full QA/QC included. Bureau Veritas: $33/sample, 18-day TAT.',
      },
    },
    {
      label: 'Environmental baseline — Katanga 18 months',
      values: {
        service: 'Environmental baseline (hydrology, biology, social) Katanga 18 months',
        quotes_text: 'AECOM: $4,800/day, 320 days, $1.54M total. Knight Piesold: $5,200/day, 280 days, $1.45M total. Local SRK: $3,900/day, 360 days, $1.40M total but limited social expertise.',
      },
    },
    {
      label: 'NI 43-101 QP — Hawkeye maiden resource',
      values: {
        service: 'NI 43-101 QP authorship for Hawkeye maiden inferred resource',
        quotes_text: 'Wood plc: $7,200/day, 40 days, $288k. SRK: $6,800/day, 45 days, $306k. Independent QP Dr. M.: $4,500/day, 50 days, $225k.',
      },
    },
  ],

  'partner-pitch-draft': [
    {
      label: 'Hawkeye Gold → Major (Barrick/Newmont)',
      values: { property_id: 'PROP-CA-001', audience: 'Tier-1 gold major exploration team' },
    },
    {
      label: 'Marble Bar Li → battery OEM',
      values: { property_id: 'PROP-AU-004', audience: 'Battery / EV OEM strategic minerals desk' },
    },
    {
      label: 'Lapland Ni → BHP Xplor',
      values: { property_id: 'PROP-FI-011', audience: 'BHP Xplor / energy transition fund' },
    },
    {
      label: 'Gobi REE → strategic minerals fund',
      values: { property_id: 'PROP-MN-013', audience: 'Western government-backed critical minerals fund' },
    },
    {
      label: 'Atacama Cu-Mo → JV with Antofagasta',
      values: { property_id: 'PROP-CL-005', audience: 'Latin American copper major (JV team)' },
    },
  ],

  'exploration-budget': [
    {
      label: 'Hawkeye — Phase II (drill + maiden resource)',
      values: { property_id: 'PROP-CA-001', objective: 'Phase II 5,000 m drill program + maiden NI 43-101 inferred resource within 14 months.' },
    },
    {
      label: 'Red Caribou — discovery program 18 months',
      values: { property_id: 'PROP-CA-002', objective: 'Discovery drilling program at Red Caribou: 8,000 m, follow-up airborne EM, geochem infill.' },
    },
    {
      label: 'Salta Li — brine evaluation 12 months',
      values: { property_id: 'PROP-AR-012', objective: 'Brine evaluation + pump tests + hydrogeology for Salta lithium brine.' },
    },
    {
      label: 'Gobi REE — initial scoping 9 months',
      values: { property_id: 'PROP-MN-013', objective: 'Initial scoping: 2,000 m RC + 1,000 m DD, mineralogy, metallurgical bench tests.' },
    },
    {
      label: 'Bushveld PGE — UG-2 step-out 24 months',
      values: { property_id: 'PROP-ZA-010', objective: 'UG-2 reef step-out drilling 12,000 m, resource update, modifying factors study.' },
    },
  ],

  'geologist-shift-plan': [
    { label: 'Default — 4-on/2-off, all active properties', values: { rotation_pattern: '4 weeks on / 2 weeks off', notes: '' } },
    { label: 'Tight roster — 5/2',                          values: { rotation_pattern: '5 weeks on / 2 weeks off', notes: 'Aggressive coverage for Q3 drill push.' } },
    { label: 'Relaxed roster — 3/3',                        values: { rotation_pattern: '3 weeks on / 3 weeks off', notes: 'Lower-tempo holding pattern.' } },
    { label: 'Surge — gold properties only',                values: { rotation_pattern: '4/2', notes: 'Surge geologists onto Hawkeye, Ashanti, Battle Mountain ahead of resource updates.' } },
    { label: 'Battery metals focus',                        values: { rotation_pattern: '4/2', notes: 'Focus rotations on Marble Bar Li, Lapland Ni, Salta Li and Katanga Co.' } },
  ],

  'geochem-pathfinder-detect': [
    { label: 'Au — Hawkeye / Ashanti / BMN',  values: { target: 'Au', context_notes: 'Look for As, Sb, Hg, Te, W pathfinders across gold properties.' } },
    { label: 'Cu — Atacama / Red Caribou',    values: { target: 'Cu', context_notes: 'Look for Mo, Au, Re, S pathfinders for porphyry Cu-Mo systems.' } },
    { label: 'Ni — Lapland Ni-Cu-PGE',        values: { target: 'Ni', context_notes: 'Look for Cu, Co, Pt, Pd, Cr pathfinders for magmatic Ni-Cu-PGE.' } },
    { label: 'Li — Marble Bar / Salta',       values: { target: 'Li', context_notes: 'For pegmatite: Cs, Rb, Ta, Sn, Be. For brine: K, Mg, B.' } },
    { label: 'REE — Gobi carbonatite',        values: { target: 'REE', context_notes: 'Look for Ce, La, Nd, Nb, F, P, Ba pathfinders for carbonatite-hosted REE.' } },
  ],

  'geophysics-interpretation': [
    { label: 'GP-2026-0001 — Hawkeye IP/Res',         values: { survey_id: 'GP-2026-0001' } },
    { label: 'GP-2026-0003 — Red Caribou airborne EM',values: { survey_id: 'GP-2026-0003' } },
    { label: 'GP-2026-0006 — Atacama CSAMT',          values: { survey_id: 'GP-2026-0006' } },
    { label: 'GP-2026-0012 — Lapland borehole EM',    values: { survey_id: 'GP-2026-0012' } },
    { label: 'GP-2026-0014 — Gobi radiometrics',      values: { survey_id: 'GP-2026-0014' } },
  ],

  'resource-statement-draft': [
    { label: 'Hawkeye Gold maiden inferred',         values: { property_id: 'PROP-CA-001' } },
    { label: 'Atacama Cu-Mo inferred',               values: { property_id: 'PROP-CL-005' } },
    { label: 'Carajas Iron Ore measured update',     values: { property_id: 'PROP-BR-007' } },
    { label: 'Bushveld PGE measured',                values: { property_id: 'PROP-ZA-010' } },
    { label: 'Salta Lithium Brine inferred',         values: { property_id: 'PROP-AR-012' } },
  ],

  'jurisdictional-risk': [
    { label: 'Canada (Hawkeye, Red Caribou)',  values: { country: 'Canada' } },
    { label: 'DRC (Katanga)',                  values: { country: 'DRC' } },
    { label: 'Argentina (Salta)',              values: { country: 'Argentina' } },
    { label: 'Papua NG (Highlands)',           values: { country: 'Papua NG' } },
    { label: 'Mongolia (Gobi REE)',            values: { country: 'Mongolia' } },
  ],

  // ── apply pass 7 ──────────────────────────────────────────────
  'lithology-classify': [
    { label: 'DDH-HAW-001 — Hawkeye Au logs',     values: { hole_id: 'DDH-HAW-001' } },
    { label: 'DDH-ATC-001 — Atacama porphyry',    values: { hole_id: 'DDH-ATC-001' } },
    { label: 'DDH-LAP-001 — Lapland Ni-Cu-PGE',   values: { hole_id: 'DDH-LAP-001' } },
    { label: 'DDH-MBL-001 — Marble Bar pegmatite',values: { hole_id: 'DDH-MBL-001' } },
    { label: 'DDH-GOB-001 — Gobi carbonatite',    values: { hole_id: 'DDH-GOB-001' } },
  ],

  'prospectivity-score': [
    { label: 'Hawkeye Au — full multi-signal',  values: { property_id: 'PROP-CA-001' } },
    { label: 'Atacama Cu-Mo porphyry',          values: { property_id: 'PROP-CL-005' } },
    { label: 'Red Caribou — discovery',         values: { property_id: 'PROP-CA-002' } },
    { label: 'Lapland Ni-Cu-PGE',               values: { property_id: 'PROP-FI-011' } },
    { label: 'Gobi REE carbonatite',            values: { property_id: 'PROP-MN-013' } },
  ],

  'resource-block-confidence': [
    { label: 'Hawkeye maiden — block confidence',     values: { property_id: 'PROP-CA-001' } },
    { label: 'Atacama Cu-Mo — block confidence',      values: { property_id: 'PROP-CL-005' } },
    { label: 'Carajas Iron — measured uplift check',  values: { property_id: 'PROP-BR-007' } },
    { label: 'Bushveld PGE — measured',               values: { property_id: 'PROP-ZA-010' } },
    { label: 'Salta Li brine — inferred',             values: { property_id: 'PROP-AR-012' } },
  ],

  'assay-anomaly-narrate': [
    { label: 'DDH-HAW-001 — Au batch narrative',  values: { hole_id: 'DDH-HAW-001', element: 'Au' } },
    { label: 'DDH-ATC-001 — Cu batch narrative',  values: { hole_id: 'DDH-ATC-001', element: 'Cu' } },
    { label: 'DDH-LAP-001 — Ni batch narrative',  values: { hole_id: 'DDH-LAP-001', element: 'Ni' } },
    { label: 'DDH-MBL-001 — Li batch narrative',  values: { hole_id: 'DDH-MBL-001', element: 'Li' } },
    { label: 'DDH-GOB-001 — REE batch narrative', values: { hole_id: 'DDH-GOB-001', element: 'REE' } },
  ],
};

// GET /api/ai/samples?feature=<verb>
router.get('/samples', (req, res) => {
  try {
    const feature = (req.query.feature || '').toString();
    if (!feature) {
      return res.json({ features: Object.keys(SAMPLES) });
    }
    const samples = SAMPLES[feature];
    if (!samples) {
      return res.status(404).json({ error: `unknown feature: ${feature}` });
    }
    res.json({ feature, samples });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/ai/history?feature=<name>&limit=<n>
router.get('/history', async (req, res) => {
  try {
    const feature = (req.query.feature || '').toString();
    const limit = Math.min(parseInt(req.query.limit, 10) || 25, 200);
    let r;
    if (feature) {
      r = await pool.query(
        'SELECT id, feature, input, output, created_at FROM ai_results WHERE feature = $1 ORDER BY created_at DESC LIMIT $2',
        [feature, limit]
      );
    } else {
      r = await pool.query(
        'SELECT id, feature, input, output, created_at FROM ai_results ORDER BY created_at DESC LIMIT $1',
        [limit]
      );
    }
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 1. POST /api/ai/anomaly-cluster
router.post('/anomaly-cluster', async (req, res) => {
  try {
    let { samples, context } = req.body || {};
    if (!Array.isArray(samples) || samples.length === 0) {
      const [g, a] = await Promise.all([
        pool.query('SELECT * FROM geochem_samples ORDER BY id ASC LIMIT 20'),
        pool.query('SELECT * FROM assay_results ORDER BY id ASC LIMIT 20'),
      ]);
      samples = [...g.rows, ...a.rows];
    }
    const result = await ai.anomalyCluster(samples, context || {});
    await record('anomaly-cluster', { samples_count: samples.length, context }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 2. POST /api/ai/drill-target-rank
router.post('/drill-target-rank', async (req, res) => {
  try {
    let { targets, budget_usd } = req.body || {};
    if (!Array.isArray(targets) || targets.length === 0) {
      const t = await pool.query('SELECT * FROM drill_targets ORDER BY id ASC LIMIT 30');
      targets = t.rows;
    }
    const result = await ai.drillTargetRank(targets, { budget_usd });
    await record('drill-target-rank', { targets_count: targets.length, budget_usd }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 3. POST /api/ai/ndp-43-101-summary { property_id }
router.post('/ndp-43-101-summary', async (req, res) => {
  try {
    const { property_id } = req.body || {};
    if (!property_id) return res.status(400).json({ error: 'property_id is required' });
    const [p, holes, assays, estimates, permits] = await Promise.all([
      pool.query('SELECT * FROM properties WHERE property_id = $1', [property_id]),
      pool.query('SELECT * FROM drill_holes WHERE property_id = $1', [property_id]),
      pool.query('SELECT a.* FROM assay_results a JOIN drill_holes h ON h.hole_id = a.hole_id WHERE h.property_id = $1', [property_id]),
      pool.query('SELECT * FROM ndp_resource_estimates WHERE property_id = $1', [property_id]),
      pool.query('SELECT * FROM permits WHERE property_id = $1', [property_id]),
    ]);
    const snapshot = { property: p.rows[0] || { property_id }, holes: holes.rows, assays: assays.rows, estimates: estimates.rows, permits: permits.rows };
    const result = await ai.ndp43101Summary(snapshot);
    await record('ndp-43-101-summary', { property_id }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 4. POST /api/ai/assay-trend { hole_id?, element? }
router.post('/assay-trend', async (req, res) => {
  try {
    const { hole_id, element } = req.body || {};
    let q = 'SELECT * FROM assay_results WHERE 1=1';
    const params = [];
    if (hole_id) { params.push(hole_id); q += ` AND hole_id = $${params.length}`; }
    if (element) { params.push(element); q += ` AND element = $${params.length}`; }
    q += ' ORDER BY from_m ASC LIMIT 200';
    const r = await pool.query(q, params);
    const result = await ai.assayTrend(r.rows, { hole_id, element });
    await record('assay-trend', { hole_id, element, n: r.rows.length }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 5. POST /api/ai/executive-brief
router.post('/executive-brief', async (req, res) => {
  try {
    const [properties, holes, assays, permits, env, targets, estimates] = await Promise.all([
      pool.query("SELECT COUNT(*) FILTER (WHERE status='active') AS active, COUNT(*) FILTER (WHERE status='permitting') AS permitting, COUNT(*) AS total FROM properties"),
      pool.query("SELECT COUNT(*) FILTER (WHERE status='in_progress') AS in_progress, COUNT(*) FILTER (WHERE status='completed') AS completed, COALESCE(SUM(depth_m),0) AS total_depth_m FROM drill_holes"),
      pool.query("SELECT COUNT(*) FILTER (WHERE element='Au' AND value_ppm >= 5) AS au_high, COUNT(*) AS total FROM assay_results"),
      pool.query("SELECT COUNT(*) FILTER (WHERE status='pending') AS pending, COUNT(*) FILTER (WHERE status='denied') AS denied, COUNT(*) AS total FROM permits"),
      pool.query("SELECT COUNT(*) FILTER (WHERE severity='critical') AS critical, COUNT(*) FILTER (WHERE severity='high') AS high, COUNT(*) AS total FROM environmental_impacts"),
      pool.query("SELECT COUNT(*) FILTER (WHERE status='approved') AS approved, COUNT(*) FILTER (WHERE priority='critical') AS critical, COUNT(*) AS total FROM drill_targets"),
      pool.query("SELECT COUNT(*) AS total FROM ndp_resource_estimates"),
    ]);
    const snapshot = {
      properties:    properties.rows[0],
      drill_holes:   holes.rows[0],
      assays:        assays.rows[0],
      permits:       permits.rows[0],
      environmental: env.rows[0],
      targets:       targets.rows[0],
      estimates:     estimates.rows[0],
      ...(req.body?.notes ? { notes: req.body.notes } : {}),
    };
    const result = await ai.execBrief(snapshot);
    const out = { snapshot, brief: result };
    await record('executive-brief', { notes: req.body?.notes || null }, out);
    res.json(out);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 6. POST /api/ai/permit-readiness { property_id }
router.post('/permit-readiness', async (req, res) => {
  try {
    const { property_id } = req.body || {};
    if (!property_id) return res.status(400).json({ error: 'property_id is required' });
    const [p, permits, env, consults] = await Promise.all([
      pool.query('SELECT * FROM properties WHERE property_id = $1', [property_id]),
      pool.query('SELECT * FROM permits WHERE property_id = $1', [property_id]),
      pool.query('SELECT * FROM environmental_impacts WHERE property_id = $1', [property_id]),
      pool.query('SELECT * FROM indigenous_consultations WHERE property_id = $1', [property_id]),
    ]);
    const result = await ai.permitReadiness({
      property: p.rows[0] || { property_id },
      permits: permits.rows,
      environmental_impacts: env.rows,
      indigenous_consultations: consults.rows,
    });
    await record('permit-readiness', { property_id }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 7. POST /api/ai/environmental-risk-brief { property_id }
router.post('/environmental-risk-brief', async (req, res) => {
  try {
    const { property_id } = req.body || {};
    if (!property_id) return res.status(400).json({ error: 'property_id is required' });
    const [p, impacts] = await Promise.all([
      pool.query('SELECT * FROM properties WHERE property_id = $1', [property_id]),
      pool.query('SELECT * FROM environmental_impacts WHERE property_id = $1 ORDER BY opened_at DESC', [property_id]),
    ]);
    const result = await ai.environmentalRiskBrief(impacts.rows, { property: p.rows[0] || { property_id } });
    await record('environmental-risk-brief', { property_id, n: impacts.rows.length }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 8. POST /api/ai/indigenous-engagement-plan { community, property_id? }
router.post('/indigenous-engagement-plan', async (req, res) => {
  try {
    const { community, property_id } = req.body || {};
    if (!community) return res.status(400).json({ error: 'community is required' });
    let propertyContext = {};
    if (property_id) {
      const [p, consults] = await Promise.all([
        pool.query('SELECT * FROM properties WHERE property_id = $1', [property_id]),
        pool.query('SELECT * FROM indigenous_consultations WHERE property_id = $1 ORDER BY ts DESC', [property_id]),
      ]);
      propertyContext = { property: p.rows[0] || { property_id }, prior_consultations: consults.rows };
    }
    const result = await ai.indigenousEngagementPlan(community, propertyContext);
    await record('indigenous-engagement-plan', { community, property_id }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 9. POST /api/ai/vendor-quote-compare { service, quotes_text }
router.post('/vendor-quote-compare', async (req, res) => {
  try {
    const { service, quotes_text, quotes } = req.body || {};
    const quoteList = Array.isArray(quotes) && quotes.length
      ? quotes
      : (quotes_text ? [{ raw: quotes_text }] : []);
    if (!service) return res.status(400).json({ error: 'service is required' });
    // Pull current approved contractors for additional context
    const c = await pool.query("SELECT * FROM contractors WHERE status = 'approved' ORDER BY id ASC LIMIT 30");
    const result = await ai.vendorQuoteCompare(quoteList, { service, approved_contractors: c.rows });
    await record('vendor-quote-compare', { service, quote_count: quoteList.length }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 10. POST /api/ai/partner-pitch-draft { property_id, audience }
router.post('/partner-pitch-draft', async (req, res) => {
  try {
    const { property_id, audience } = req.body || {};
    if (!property_id) return res.status(400).json({ error: 'property_id is required' });
    const [p, estimates, holes, partners] = await Promise.all([
      pool.query('SELECT * FROM properties WHERE property_id = $1', [property_id]),
      pool.query('SELECT * FROM ndp_resource_estimates WHERE property_id = $1', [property_id]),
      pool.query('SELECT * FROM drill_holes WHERE property_id = $1', [property_id]),
      pool.query('SELECT * FROM partners ORDER BY id ASC LIMIT 15'),
    ]);
    const ctx = {
      property: p.rows[0] || { property_id },
      estimates: estimates.rows,
      holes: holes.rows,
      partner_universe: partners.rows.map((x) => ({ name: x.name, type: x.type })),
    };
    const result = await ai.partnerPitchDraft(ctx, audience || 'unspecified investor');
    await record('partner-pitch-draft', { property_id, audience }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 11. POST /api/ai/exploration-budget { property_id?, objective }
router.post('/exploration-budget', async (req, res) => {
  try {
    const { property_id, objective } = req.body || {};
    if (!objective) return res.status(400).json({ error: 'objective is required' });
    let propertyContext = {};
    if (property_id) {
      const [p, expenses] = await Promise.all([
        pool.query('SELECT * FROM properties WHERE property_id = $1', [property_id]),
        pool.query('SELECT * FROM expense_reports WHERE property_id = $1 ORDER BY id ASC', [property_id]),
      ]);
      propertyContext = { property: p.rows[0] || { property_id }, prior_expenses: expenses.rows };
    }
    const result = await ai.explorationBudget({ objective }, propertyContext);
    await record('exploration-budget', { property_id, objective }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 12. POST /api/ai/geologist-shift-plan
router.post('/geologist-shift-plan', async (req, res) => {
  try {
    const { rotation_pattern, notes } = req.body || {};
    let { geologists } = req.body || {};
    if (!Array.isArray(geologists) || geologists.length === 0) {
      const r = await pool.query('SELECT * FROM geologists ORDER BY id ASC LIMIT 30');
      geologists = r.rows;
    }
    const props = await pool.query("SELECT property_id, name, country, status FROM properties WHERE status IN ('active','permitting')");
    const result = await ai.geologistShiftPlan(geologists, { rotation_pattern, notes, properties: props.rows });
    await record('geologist-shift-plan', { rotation_pattern, geologists_count: geologists.length }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 13. POST /api/ai/geochem-pathfinder-detect { target?, context_notes? }
router.post('/geochem-pathfinder-detect', async (req, res) => {
  try {
    const { target, context_notes } = req.body || {};
    let { samples } = req.body || {};
    if (!Array.isArray(samples) || samples.length === 0) {
      const r = await pool.query('SELECT * FROM geochem_samples ORDER BY id ASC LIMIT 30');
      samples = r.rows;
    }
    const result = await ai.geochemPathfinderDetect(samples, target || 'Au');
    await record('geochem-pathfinder-detect', { target, n: samples.length, context_notes }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 14. POST /api/ai/geophysics-interpretation { survey_id }
router.post('/geophysics-interpretation', async (req, res) => {
  try {
    const { survey_id } = req.body || {};
    if (!survey_id) return res.status(400).json({ error: 'survey_id is required' });
    const s = await pool.query('SELECT * FROM geophysics_surveys WHERE survey_id = $1', [survey_id]);
    const survey = s.rows[0] || { survey_id };
    let propertyContext = {};
    if (survey.property_id) {
      const p = await pool.query('SELECT * FROM properties WHERE property_id = $1', [survey.property_id]);
      propertyContext = { property: p.rows[0] };
    }
    const result = await ai.geophysicsInterpretation(survey, propertyContext);
    await record('geophysics-interpretation', { survey_id }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 15. POST /api/ai/resource-statement-draft { property_id }
router.post('/resource-statement-draft', async (req, res) => {
  try {
    const { property_id } = req.body || {};
    if (!property_id) return res.status(400).json({ error: 'property_id is required' });
    const [p, estimates] = await Promise.all([
      pool.query('SELECT * FROM properties WHERE property_id = $1', [property_id]),
      pool.query('SELECT * FROM ndp_resource_estimates WHERE property_id = $1 ORDER BY id ASC', [property_id]),
    ]);
    const result = await ai.resourceStatementDraft(estimates.rows, { property: p.rows[0] || { property_id } });
    await record('resource-statement-draft', { property_id, n: estimates.rows.length }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 16. POST /api/ai/jurisdictional-risk { country, property_id? }
router.post('/jurisdictional-risk', async (req, res) => {
  try {
    const { country, property_id } = req.body || {};
    if (!country) return res.status(400).json({ error: 'country is required' });
    let propertyContext = {};
    if (property_id) {
      const p = await pool.query('SELECT * FROM properties WHERE property_id = $1', [property_id]);
      propertyContext = { property: p.rows[0] };
    } else {
      const p = await pool.query('SELECT * FROM properties WHERE country ILIKE $1 LIMIT 10', [`%${country}%`]);
      propertyContext = { properties_in_country: p.rows };
    }
    const result = await ai.jurisdictionalRisk(country, propertyContext);
    await record('jurisdictional-risk', { country, property_id }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─────────────────────────────────────────────────────────────
// apply pass 7 — backlog endpoints
// ─────────────────────────────────────────────────────────────

// 17. POST /api/ai/lithology-classify { hole_id?, property_id? }
router.post('/lithology-classify', async (req, res) => {
  try {
    const { hole_id, property_id } = req.body || {};
    let { logs } = req.body || {};
    if (!Array.isArray(logs) || logs.length === 0) {
      if (hole_id) {
        const r = await pool.query('SELECT * FROM geological_logs WHERE hole_id = $1 ORDER BY from_m ASC LIMIT 200', [hole_id]);
        logs = r.rows;
      } else if (property_id) {
        const r = await pool.query(
          'SELECT g.* FROM geological_logs g JOIN drill_holes h ON h.hole_id = g.hole_id WHERE h.property_id = $1 ORDER BY g.id ASC LIMIT 200',
          [property_id]
        );
        logs = r.rows;
      } else {
        const r = await pool.query('SELECT * FROM geological_logs ORDER BY id ASC LIMIT 60');
        logs = r.rows;
      }
    }
    const result = await ai.lithologyClassify(logs, { hole_id, property_id });
    await record('lithology-classify', { hole_id, property_id, n: logs.length }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 18. POST /api/ai/prospectivity-score { property_id }
router.post('/prospectivity-score', async (req, res) => {
  try {
    const { property_id } = req.body || {};
    if (!property_id) return res.status(400).json({ error: 'property_id is required' });
    const [p, holes, assays, geophys, geochem, logs, targets] = await Promise.all([
      pool.query('SELECT * FROM properties WHERE property_id = $1', [property_id]),
      pool.query('SELECT * FROM drill_holes WHERE property_id = $1', [property_id]),
      pool.query('SELECT a.* FROM assay_results a JOIN drill_holes h ON h.hole_id = a.hole_id WHERE h.property_id = $1 LIMIT 200', [property_id]),
      pool.query('SELECT * FROM geophysics_surveys WHERE property_id = $1', [property_id]),
      pool.query('SELECT * FROM geochem_samples WHERE property_id = $1', [property_id]),
      pool.query('SELECT g.* FROM geological_logs g JOIN drill_holes h ON h.hole_id = g.hole_id WHERE h.property_id = $1 LIMIT 100', [property_id]),
      pool.query('SELECT * FROM drill_targets WHERE property_id = $1', [property_id]),
    ]);
    const signals = {
      property: p.rows[0] || { property_id },
      drill_hole_count: holes.rows.length,
      assay_signal: {
        n: assays.rows.length,
        max_value: assays.rows.reduce((m, r) => Math.max(m, Number(r.value_ppm) || 0), 0),
        elements: Array.from(new Set(assays.rows.map((r) => r.element))).filter(Boolean),
      },
      geophysics_signal: { n: geophys.rows.length, methods: geophys.rows.map((r) => r.method) },
      geochem_signal:    { n: geochem.rows.length, types: geochem.rows.map((r) => r.type) },
      structural_signal: { n: logs.rows.length, structures: logs.rows.map((r) => r.structure).filter(Boolean).slice(0, 30) },
      target_signal:     { n: targets.rows.length, priorities: targets.rows.map((r) => r.priority) },
    };
    const result = await ai.prospectivityScore(signals, { property_id });
    await record('prospectivity-score', { property_id }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 19. POST /api/ai/resource-block-confidence { property_id }
router.post('/resource-block-confidence', async (req, res) => {
  try {
    const { property_id } = req.body || {};
    if (!property_id) return res.status(400).json({ error: 'property_id is required' });
    const [p, estimates, holes] = await Promise.all([
      pool.query('SELECT * FROM properties WHERE property_id = $1', [property_id]),
      pool.query('SELECT * FROM ndp_resource_estimates WHERE property_id = $1 ORDER BY id ASC', [property_id]),
      pool.query('SELECT * FROM drill_holes WHERE property_id = $1', [property_id]),
    ]);
    const ctx = { property: p.rows[0] || { property_id }, drill_hole_count: holes.rows.length };
    const result = await ai.resourceBlockConfidence(estimates.rows, ctx);
    await record('resource-block-confidence', { property_id, n: estimates.rows.length }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 20. POST /api/ai/assay-anomaly-narrate { hole_id?, property_id?, element? }
router.post('/assay-anomaly-narrate', async (req, res) => {
  try {
    const { hole_id, property_id, element } = req.body || {};
    let { assays } = req.body || {};
    if (!Array.isArray(assays) || assays.length === 0) {
      const where = [];
      const params = [];
      if (hole_id)    { params.push(hole_id);    where.push(`hole_id = $${params.length}`); }
      if (element)    { params.push(element);    where.push(`element = $${params.length}`); }
      let q = 'SELECT * FROM assay_results';
      if (property_id) {
        params.push(property_id);
        q = `SELECT a.* FROM assay_results a JOIN drill_holes h ON h.hole_id = a.hole_id WHERE h.property_id = $${params.length}`;
        if (where.length) q += ' AND ' + where.map((w) => 'a.' + w).join(' AND ');
      } else if (where.length) {
        q += ' WHERE ' + where.join(' AND ');
      }
      q += ' ORDER BY from_m ASC LIMIT 200';
      const r = await pool.query(q, params);
      assays = r.rows;
    }
    const result = await ai.assayAnomalyNarrate(assays, { hole_id, property_id, element });
    await record('assay-anomaly-narrate', { hole_id, property_id, element, n: assays.length }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─────────────────────────────────────────────────────────────
// 3D block-model — NEEDS-PRODUCT-DECISION implemented as coarse grid
// GET  /api/ai/block-model?property_id=...
// POST /api/ai/block-model { property_id, nx?, ny?, nz?, block_size_m?, commodity? }
//   POST builds a synthetic coarse grid from the property's assays
//   (assay max grade per hole used as seed), persists it, returns the grid.
// ─────────────────────────────────────────────────────────────
function synthesizeBlockGrid({ nx, ny, nz, holes, assays }) {
  // Build voxel grid nz[ny[nx]] with grades derived from nearest hole.
  // Coarse, deterministic — purely for visual demo / 2D heatmap fallback.
  const grid = [];
  // Project holes into the (nx,ny) plane evenly by index.
  const holePts = holes.map((h, i) => ({
    ix: holes.length ? Math.floor((i / Math.max(holes.length, 1)) * nx) : 0,
    iy: holes.length ? (i % Math.max(1, ny)) : 0,
    grade: (() => {
      const a = assays.filter((x) => x.hole_id === h.hole_id);
      const m = a.reduce((mx, r) => Math.max(mx, Number(r.value_ppm) || 0), 0);
      return m || 0;
    })(),
  }));
  const maxGrade = holePts.reduce((m, p) => Math.max(m, p.grade), 0) || 1;
  for (let z = 0; z < nz; z++) {
    const plane = [];
    for (let y = 0; y < ny; y++) {
      const row = [];
      for (let x = 0; x < nx; x++) {
        let best = 0;
        for (const p of holePts) {
          const d = Math.sqrt((p.ix - x) ** 2 + (p.iy - y) ** 2);
          // Inverse-distance falloff + depth attenuation
          const falloff = 1 / (1 + d * d);
          const depthAtt = 1 - Math.abs(z - nz / 2) / nz;
          const v = p.grade * falloff * depthAtt;
          if (v > best) best = v;
        }
        row.push(Number((best / maxGrade).toFixed(4)));
      }
      plane.push(row);
    }
    grid.push(plane);
  }
  return grid;
}

router.get('/block-model', async (req, res) => {
  try {
    const { property_id } = req.query;
    if (!property_id) return res.status(400).json({ error: 'property_id is required' });
    const r = await pool.query(
      'SELECT * FROM block_models WHERE property_id = $1 ORDER BY id DESC LIMIT 1',
      [property_id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'no block model — POST to /api/ai/block-model to build one' });
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/block-model', async (req, res) => {
  try {
    const { property_id, commodity } = req.body || {};
    const nx = Math.max(4, Math.min(40, parseInt(req.body?.nx, 10) || 20));
    const ny = Math.max(4, Math.min(40, parseInt(req.body?.ny, 10) || 20));
    const nz = Math.max(2, Math.min(20, parseInt(req.body?.nz, 10) || 10));
    const block_size_m = Number(req.body?.block_size_m) || 25;
    if (!property_id) return res.status(400).json({ error: 'property_id is required' });

    const [holes, assays] = await Promise.all([
      pool.query('SELECT * FROM drill_holes WHERE property_id = $1 ORDER BY id ASC', [property_id]),
      pool.query('SELECT a.* FROM assay_results a JOIN drill_holes h ON h.hole_id = a.hole_id WHERE h.property_id = $1', [property_id]),
    ]);
    const grid = synthesizeBlockGrid({ nx, ny, nz, holes: holes.rows, assays: assays.rows });
    const model_id = `BM-${property_id}-${Date.now()}`;
    const r = await pool.query(
      `INSERT INTO block_models (model_id, property_id, commodity, nx, ny, nz, block_size_m, grid, source, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [model_id, property_id, commodity || null, nx, ny, nz, block_size_m, JSON.stringify(grid),
       'synthetic-from-assays', `Coarse synthetic grid from ${holes.rows.length} holes / ${assays.rows.length} assays`]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─────────────────────────────────────────────────────────────
// External geophysical feeds — NEEDS-CREDS, served as 503 stubs.
// ─────────────────────────────────────────────────────────────
function externalFeedStub(req, res) {
  res.status(503).json({
    error: 'external feed not configured',
    feed: req.params.feed || req.path.replace(/^\//, ''),
    reason: 'NEEDS-CREDS — set the corresponding API key / endpoint in .env to enable',
    docs: 'See backend/services/ai.js for the canonical credentials pattern',
  });
}
router.get('/external-feeds/:feed', externalFeedStub);
router.post('/external-feeds/:feed', externalFeedStub);

module.exports = router;
