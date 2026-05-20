const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { authenticateToken } = require('./middleware/auth');
const pool = require('./config/database');
const { fireWebhook } = require('./services/webhooks');

// ─────────────────────────────────────────────────────────────
// Side-effect hooks for new-row events that should fan out to
// notifications + webhooks. Wired into individual CRUD routers
// below via the small `wireOnCreated` helper.
// ─────────────────────────────────────────────────────────────
async function onAssayResultCreated(row) {
  // Trigger a notification when high-grade pay-zones come back.
  try {
    const elem = String(row.element || '').toLowerCase();
    const val  = Number(row.value_ppm || 0);
    let severity = 'info';
    if (elem === 'au' && val >= 5) severity = 'high';
    else if (elem === 'au' && val >= 1) severity = 'medium';
    else if (['ag','cu','ni','li','co'].includes(elem) && val >= 5000) severity = 'high';

    if (severity === 'high' || severity === 'medium') {
      await pool.query(
        `INSERT INTO notifications (user_id, title, body, severity, source)
         VALUES (NULL, $1, $2, $3, $4)`,
        [
          `Assay returned: ${row.element} ${val}`,
          `${row.hole_id} ${row.from_m}-${row.to_m}m`,
          severity,
          'assay_results',
        ]
      );
      fireWebhook(`assay.${severity}`, { row }).catch(() => {});
    }
  } catch (e) { console.warn('[notify] assay insert failed:', e.message); }
}

async function onEnvironmentalImpactCreated(row) {
  const sev = String(row.severity || '').toLowerCase();
  if (['critical', 'high'].includes(sev)) {
    try {
      await pool.query(
        `INSERT INTO notifications (user_id, title, body, severity, source)
         VALUES (NULL, $1, $2, $3, $4)`,
        [
          `Environmental flag: ${row.type}`,
          `${row.property_id} — severity ${sev}`,
          sev,
          'environmental_impacts',
        ]
      );
    } catch (e) { console.warn('[notify] environmental insert failed:', e.message); }
    fireWebhook(`environmental.${sev}`, { row }).catch(() => {});
  }
}

async function onDrillTargetCreated(row) {
  try {
    await pool.query(
      `INSERT INTO notifications (user_id, title, body, severity, source)
       VALUES (NULL, $1, $2, $3, $4)`,
      [
        `New drill target: ${row.name}`,
        `${row.property_id} — ${row.target_type} (${row.priority})`,
        'info',
        'drill_targets',
      ]
    );
  } catch (e) { console.warn('[notify] drill_target insert failed:', e.message); }
  fireWebhook('target.approved', { row }).catch(() => {});
}

// Wraps the small CRUD routers from _crudFactory so we can hook
// onCreated without rewriting that file.
function wireOnCreated(router, hook) {
  if (typeof hook !== 'function') return router;
  const outer = express.Router();
  outer.use((req, res, next) => {
    if (req.method !== 'POST') return next();
    const origJson = res.json.bind(res);
    res.json = (body) => {
      try {
        if (res.statusCode === 201 && body && body.id) {
          Promise.resolve(hook(body, req)).catch((e) =>
            console.warn('[hook] failed:', e.message)
          );
        }
      } catch (_) {}
      return origJson(body);
    };
    next();
  });
  outer.use(router);
  return outer;
}

const app = express();
const PORT = process.env.BACKEND_PORT || 3081;

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3080,http://localhost:3081,http://localhost:3000')
  .split(',').map((o) => o.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Health check (public)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth (public)
app.use('/api/auth', require('./routes/auth'));

// Everything below this line requires a Bearer token.
app.use('/api', authenticateToken);

// ─────────────────────────────────────────────────────────────
// 18 CRUD entities — junior mining exploration geology
// ─────────────────────────────────────────────────────────────
app.use('/api/properties',                require('./routes/properties'));
app.use('/api/claims',                    require('./routes/claims'));
app.use('/api/drill-holes',               require('./routes/drillHoles'));
app.use('/api/assay-results',             wireOnCreated(require('./routes/assayResults'),          onAssayResultCreated));
app.use('/api/geophysics-surveys',        require('./routes/geophysicsSurveys'));
app.use('/api/geochem-samples',           require('./routes/geochemSamples'));
app.use('/api/geological-logs',           require('./routes/geologicalLogs'));
app.use('/api/geologists',                require('./routes/geologists'));
app.use('/api/contractors',               require('./routes/contractors'));
app.use('/api/samples-inventory',         require('./routes/samplesInventory'));
app.use('/api/permits',                   require('./routes/permits'));
app.use('/api/environmental-impacts',     wireOnCreated(require('./routes/environmentalImpacts'),  onEnvironmentalImpactCreated));
app.use('/api/indigenous-consultations',  require('./routes/indigenousConsultations'));
app.use('/api/drill-targets',             wireOnCreated(require('./routes/drillTargets'),          onDrillTargetCreated));
app.use('/api/ndp-resource-estimates',    require('./routes/ndpResourceEstimates'));
app.use('/api/expense-reports',           require('./routes/expenseReports'));
app.use('/api/partners',                  require('./routes/partners'));
app.use('/api/audit-log',                 require('./routes/auditLog'));

// AI routes (16 sub-endpoints + history + samples under /api/ai)
app.use('/api/ai', require('./routes/ai'));

// Cross-cutting
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/attachments',   require('./routes/attachments'));
app.use('/api/webhooks',      require('./routes/webhooks'));

// Dashboard stats
app.use('/api/dashboard', require('./routes/dashboard'));

// Custom Exploration Views (4 specialized visualizations)
app.use('/api/custom-views', require('./routes/customViews'));

app.listen(PORT, () => {
  console.log(`\nAI Mineral Exploration Geology API running on http://localhost:${PORT}\n`);
});
