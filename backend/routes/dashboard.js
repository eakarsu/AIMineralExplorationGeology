const express = require('express');
const router = express.Router();
const pool = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const [
      properties, claims, holes, assays, geophys, geochem, logs,
      geos, contractors, inv, permits, env, consults, targets,
      estimates, expenses, partners, audits,
    ] = await Promise.all([
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='active') AS active, COUNT(*) FILTER (WHERE status='permitting') AS permitting FROM properties"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='in_good_standing') AS good_standing, COUNT(*) FILTER (WHERE status='pending_renewal') AS pending_renewal, COALESCE(SUM(area_ha),0) AS total_area_ha FROM claims"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='completed') AS completed, COUNT(*) FILTER (WHERE status='in_progress') AS in_progress, COUNT(*) FILTER (WHERE status='planned') AS planned, COALESCE(SUM(depth_m),0) AS total_depth_m FROM drill_holes"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE element='Au' AND value_ppm >= 5) AS au_high FROM assay_results"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='completed') AS completed FROM geophysics_surveys"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='analyzed') AS analyzed, COUNT(*) FILTER (WHERE status='pending') AS pending FROM geochem_samples"),
      pool.query("SELECT COUNT(*) AS total FROM geological_logs"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='active') AS active, COUNT(*) FILTER (WHERE status='on_rotation') AS on_rotation FROM geologists"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='approved') AS approved, COUNT(*) FILTER (WHERE status='under_review') AS under_review FROM contractors"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE qa_status='pending') AS pending, COUNT(*) FILTER (WHERE qa_status='in_transit') AS in_transit FROM samples_inventory"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='issued') AS issued, COUNT(*) FILTER (WHERE status='pending') AS pending, COUNT(*) FILTER (WHERE status='denied') AS denied FROM permits"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE severity='critical') AS critical, COUNT(*) FILTER (WHERE severity='high') AS high, COUNT(*) FILTER (WHERE status='open') AS open FROM environmental_impacts"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='in_progress') AS in_progress, COUNT(*) FILTER (WHERE status='open') AS open FROM indigenous_consultations"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='approved') AS approved, COUNT(*) FILTER (WHERE priority='critical') AS critical FROM drill_targets"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE category='Inferred') AS inferred, COUNT(*) FILTER (WHERE category='Indicated') AS indicated, COUNT(*) FILTER (WHERE category='Measured') AS measured FROM ndp_resource_estimates"),
      pool.query("SELECT COUNT(*) AS total, COALESCE(SUM(amount_usd),0) AS total_usd FROM expense_reports"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='active') AS active FROM partners"),
      pool.query("SELECT COUNT(*) AS total FROM audit_log"),
    ]);

    res.json({
      properties:               properties.rows[0],
      claims:                   claims.rows[0],
      drill_holes:              holes.rows[0],
      assay_results:            assays.rows[0],
      geophysics_surveys:       geophys.rows[0],
      geochem_samples:          geochem.rows[0],
      geological_logs:          logs.rows[0],
      geologists:               geos.rows[0],
      contractors:              contractors.rows[0],
      samples_inventory:        inv.rows[0],
      permits:                  permits.rows[0],
      environmental_impacts:    env.rows[0],
      indigenous_consultations: consults.rows[0],
      drill_targets:            targets.rows[0],
      ndp_resource_estimates:   estimates.rows[0],
      expense_reports:          expenses.rows[0],
      partners:                 partners.rows[0],
      audit_log:                audits.rows[0],
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
