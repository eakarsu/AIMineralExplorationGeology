const express = require('express');
const router = express.Router();

router.post('/audit', (req, res) => {
  const { trays = [], handoffs = [] } = req.body || {};
  const trayRows = Array.isArray(trays) ? trays : [];
  const handoffRows = Array.isArray(handoffs) ? handoffs : [];
  const handoffByTray = handoffRows.reduce((map, handoff) => {
    const key = handoff.trayId || 'unknown';
    map[key] = map[key] || [];
    map[key].push(handoff);
    return map;
  }, {});

  const findings = trayRows.map((tray) => {
    const events = handoffByTray[tray.trayId] || [];
    const missingPhotos = !tray.photoLogged;
    const unsealed = tray.sealStatus !== 'sealed';
    const sparseHandoffs = events.length < 2;
    const score = Math.min(100, (missingPhotos ? 35 : 0) + (unsealed ? 35 : 0) + (sparseHandoffs ? 20 : 0) + (tray.assayPriority === 'high' ? 10 : 0));
    return {
      trayId: tray.trayId,
      holeId: tray.holeId,
      fromM: tray.fromM,
      toM: tray.toM,
      custodyRisk: score,
      band: score >= 70 ? 'critical' : score >= 40 ? 'review' : 'clear',
      flags: [
        ...(missingPhotos ? ['missing photo log'] : []),
        ...(unsealed ? ['seal not confirmed'] : []),
        ...(sparseHandoffs ? ['insufficient handoff trail'] : []),
      ],
    };
  }).sort((a, b) => b.custodyRisk - a.custodyRisk);

  res.json({ feature: 'Drill Core Chain Of Custody', findings, highRiskCount: findings.filter((item) => item.custodyRisk >= 70).length });
});

module.exports = router;
