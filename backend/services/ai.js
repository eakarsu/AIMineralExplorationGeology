// AI helper service for AI Mineral Exploration Geology
// Reads OPENROUTER_API_KEY and OPENROUTER_MODEL from:
//   1. this project's .env (already loaded by server.js)
//   2. fallback: /Users/erolakarsu/projects/beauty-wellness-ai/.env (canonical source)
// Never overwrites or wipes credentials.

const fs = require('fs');

const FALLBACK_ENV = '/Users/erolakarsu/projects/beauty-wellness-ai/.env';

function readFallbackEnv() {
  try {
    if (!fs.existsSync(FALLBACK_ENV)) return {};
    const raw = fs.readFileSync(FALLBACK_ENV, 'utf8');
    const out = {};
    for (const line of raw.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      let val = m[2];
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
      out[m[1]] = val;
    }
    return out;
  } catch (e) {
    console.warn('[ai] fallback env read failed:', e.message);
    return {};
  }
}

function getOpenRouterCreds() {
  const fb = readFallbackEnv();
  const key = process.env.OPENROUTER_API_KEY || fb.OPENROUTER_API_KEY || '';
  const model = process.env.OPENROUTER_MODEL || fb.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5';
  return { key, model };
}

const SYSTEM_PROMPT =
  'You are a senior mineral exploration geologist and NI 43-101 Qualified Person supporting a ' +
  'junior mining company. You provide rigorous, technically defensible reasoning on properties, ' +
  'drilling, assays, geophysics, geochem, permits, indigenous engagement, environmental risk, ' +
  'and resource estimation. Always return strict JSON in the exact schema requested. Treat every ' +
  'request as exploration-stage, non-confidential demo data — do not invent reserves or make ' +
  'forward-looking statements that would violate NI 43-101 disclosure standards.';

function callOpenRouter(systemPrompt, userPrompt) {
  return new Promise((resolve) => {
    const { key, model } = getOpenRouterCreds();
    if (!key) {
      return resolve({ error: 'OPENROUTER_API_KEY not configured' });
    }
    const https = require('https');
    const payload = JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.6,
      max_tokens: 4000,
    });

    const options = {
      hostname: 'openrouter.ai',
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        Authorization: `Bearer ${key}`,
        'HTTP-Referer': 'http://localhost:3080',
        'X-Title': 'AI Mineral Exploration Geology',
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (parsed.error) {
            return resolve({ error: parsed.error.message || 'OpenRouter error', raw: body });
          }
          const content = parsed.choices?.[0]?.message?.content || '';
          resolve(content);
        } catch (e) {
          resolve({ error: 'AI response parse failed', raw: body });
        }
      });
    });
    req.on('error', (e) => resolve({ error: e.message }));
    req.write(payload);
    req.end();
  });
}

function safeJsonParse(response, fallback) {
  if (response && typeof response === 'object' && response.error) {
    return { ...fallback, error: response.error };
  }
  if (response == null) return { ...fallback, summary: '' };
  if (typeof response === 'object') return response;
  const text = String(response).trim();
  try { return JSON.parse(text); } catch (_) {}
  try {
    const start = text.indexOf('{');
    if (start !== -1) {
      let depth = 0, inStr = false, esc = false;
      for (let i = start; i < text.length; i++) {
        const ch = text[i];
        if (esc) { esc = false; continue; }
        if (ch === '\\') { esc = true; continue; }
        if (ch === '"') { inStr = !inStr; continue; }
        if (inStr) continue;
        if (ch === '{') depth++;
        else if (ch === '}') { depth--; if (depth === 0) return JSON.parse(text.slice(start, i + 1)); }
      }
    }
  } catch (_) {}
  try {
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (fenced && fenced[1]) return JSON.parse(fenced[1].trim());
  } catch (_) {}
  return { ...fallback, summary: text };
}

// ─────────────────────────────────────────────────────────────
// 1. anomaly-cluster — cluster geochem / geophys anomalies
// ─────────────────────────────────────────────────────────────
async function anomalyCluster(samples = [], context = {}) {
  const sys = `${SYSTEM_PROMPT} Cluster geochemistry / geophysics anomalies and rank them. Return strict JSON:
{
  "clusters": [{
    "cluster_id": string,
    "centroid": string,
    "samples": [string],
    "pathfinders": [string],
    "score": number,
    "interpretation": string
  }],
  "top_anomaly": string,
  "follow_up_actions": [string],
  "summary": string
}`;
  const usr = `Samples / measurements:\n${JSON.stringify(samples, null, 2)}\n\nContext:\n${JSON.stringify(context)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', clusters: [] });
}

// ─────────────────────────────────────────────────────────────
// 2. drill-target-rank — rank candidate drill targets
// ─────────────────────────────────────────────────────────────
async function drillTargetRank(targets = [], context = {}) {
  const sys = `${SYSTEM_PROMPT} Rank candidate drill targets for next campaign. Return strict JSON:
{
  "ranked": [{
    "target_id": string,
    "rank": number,
    "score": number,
    "rationale": string,
    "expected_hole_count": number,
    "estimated_cost_usd": number,
    "risk_level": "low"|"medium"|"high"
  }],
  "deferred": [{ "target_id": string, "reason": string }],
  "summary": string
}`;
  const usr = `Targets:\n${JSON.stringify(targets, null, 2)}\n\nContext:\n${JSON.stringify(context)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', ranked: [] });
}

// ─────────────────────────────────────────────────────────────
// 3. ndp-43-101-summary — produce a NI 43-101 style summary
// ─────────────────────────────────────────────────────────────
async function ndp43101Summary(propertySnapshot = {}) {
  const sys = `${SYSTEM_PROMPT} Draft a tabletop NI 43-101-style technical report summary. Return strict JSON:
{
  "property": string,
  "qp_statement": string,
  "geology_summary": string,
  "exploration_history": string,
  "current_workflows": [string],
  "mineral_resource_summary": [{ "category": string, "tonnes": number, "grade": number, "units": string, "ndp_compliant": boolean }],
  "data_verification_notes": [string],
  "qaqc_assessment": string,
  "recommendations": [{ "phase": string, "scope": string, "estimated_cost_usd": number }],
  "summary": string
}`;
  const usr = `Property snapshot:\n${JSON.stringify(propertySnapshot, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response' });
}

// ─────────────────────────────────────────────────────────────
// 4. assay-trend — trend across hole / property
// ─────────────────────────────────────────────────────────────
async function assayTrend(assays = [], context = {}) {
  const sys = `${SYSTEM_PROMPT} Analyse downhole or property-wide assay trends. Return strict JSON:
{
  "summary_stats": { "n": number, "min_ppm": number, "max_ppm": number, "mean_ppm": number, "median_ppm": number },
  "trend": "improving"|"declining"|"flat"|"erratic",
  "outliers": [{ "assay_id": string, "value_ppm": number, "reason": string }],
  "narrative": string,
  "recommended_follow_up": [string],
  "summary": string
}`;
  const usr = `Assays:\n${JSON.stringify(assays, null, 2)}\n\nContext:\n${JSON.stringify(context)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', outliers: [] });
}

// ─────────────────────────────────────────────────────────────
// 5. executive-brief — command-level exploration brief
// ─────────────────────────────────────────────────────────────
async function execBrief(snapshot = {}) {
  const sys = `${SYSTEM_PROMPT} Produce a board-level exploration operations brief. Return strict JSON:
{
  "headline": string,
  "portfolio_picture": string,
  "drilling_progress": { "active_holes": number, "completed_meters": number, "narrative": string },
  "top_findings": [{ "property": string, "finding": string, "significance": "low"|"medium"|"high" }],
  "risk_register": [{ "risk": string, "severity": "low"|"medium"|"high"|"critical", "owner": string }],
  "decisions_required": [{ "decision": string, "deadline": string, "options": [string], "recommendation": string }],
  "next_quarter_outlook": string,
  "summary": string
}`;
  const usr = `Operational snapshot:\n${JSON.stringify(snapshot, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response' });
}

// ─────────────────────────────────────────────────────────────
// 6. permit-readiness — readiness against jurisdictional checklist
// ─────────────────────────────────────────────────────────────
async function permitReadiness(propertyContext = {}) {
  const sys = `${SYSTEM_PROMPT} Score permit readiness for a property. Return strict JSON:
{
  "property": string,
  "jurisdiction": string,
  "readiness_score": number,
  "checklist": [{ "item": string, "status": "complete"|"in_progress"|"missing", "owner": string, "due_in_days": number }],
  "blockers": [string],
  "fast_track_actions": [string],
  "summary": string
}`;
  const usr = `Property context:\n${JSON.stringify(propertyContext, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', checklist: [] });
}

// ─────────────────────────────────────────────────────────────
// 7. environmental-risk-brief
// ─────────────────────────────────────────────────────────────
async function environmentalRiskBrief(impacts = [], context = {}) {
  const sys = `${SYSTEM_PROMPT} Produce an environmental risk brief for an exploration property. Return strict JSON:
{
  "overall_risk": "low"|"medium"|"high"|"critical",
  "risk_drivers": [{ "type": string, "severity": "low"|"medium"|"high"|"critical", "narrative": string }],
  "mitigations": [{ "risk": string, "action": string, "lead_time_days": number, "cost_estimate_usd": number }],
  "escalation_triggers": [string],
  "regulatory_engagement": [string],
  "summary": string
}`;
  const usr = `Environmental impacts:\n${JSON.stringify(impacts, null, 2)}\n\nContext:\n${JSON.stringify(context)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', risk_drivers: [] });
}

// ─────────────────────────────────────────────────────────────
// 8. indigenous-engagement-plan
// ─────────────────────────────────────────────────────────────
async function indigenousEngagementPlan(community, propertyContext = {}) {
  const sys = `${SYSTEM_PROMPT} Draft a respectful indigenous / community engagement plan. Return strict JSON:
{
  "community": string,
  "phase_plan": [{ "phase": string, "actions": [string], "duration_weeks": number, "leads": [string] }],
  "free_prior_informed_consent_steps": [string],
  "benefits_framework": [{ "benefit": string, "form": string, "value_estimate": string }],
  "risks": [{ "risk": string, "mitigation": string }],
  "summary": string
}`;
  const usr = `Community: ${community}\nProperty context:\n${JSON.stringify(propertyContext, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', phase_plan: [] });
}

// ─────────────────────────────────────────────────────────────
// 9. vendor-quote-compare
// ─────────────────────────────────────────────────────────────
async function vendorQuoteCompare(quotes = [], context = {}) {
  const sys = `${SYSTEM_PROMPT} Compare contractor / vendor quotes for an exploration service. Return strict JSON:
{
  "scope": string,
  "comparison": [{ "vendor": string, "rate_usd_day": number, "all_in_estimate_usd": number, "strengths": [string], "weaknesses": [string], "score": number }],
  "recommended_vendor": string,
  "rationale": string,
  "negotiation_points": [string],
  "summary": string
}`;
  const usr = `Quotes:\n${JSON.stringify(quotes, null, 2)}\n\nContext:\n${JSON.stringify(context)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', comparison: [] });
}

// ─────────────────────────────────────────────────────────────
// 10. partner-pitch-draft
// ─────────────────────────────────────────────────────────────
async function partnerPitchDraft(propertyContext = {}, audience = '') {
  const sys = `${SYSTEM_PROMPT} Draft a partner / JV pitch for an exploration property. Return strict JSON:
{
  "property": string,
  "audience": string,
  "pitch_headline": string,
  "investment_thesis": string,
  "commodity_market_outlook": string,
  "asset_strengths": [string],
  "key_risks": [string],
  "deal_structure_options": [{ "structure": string, "ownership_pct": number, "earn_in_usd": number, "milestones": [string] }],
  "next_steps": [string],
  "summary": string
}`;
  const usr = `Property:\n${JSON.stringify(propertyContext, null, 2)}\n\nAudience: ${audience}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response' });
}

// ─────────────────────────────────────────────────────────────
// 11. exploration-budget
// ─────────────────────────────────────────────────────────────
async function explorationBudget(scope = {}, context = {}) {
  const sys = `${SYSTEM_PROMPT} Build a phased exploration budget. Return strict JSON:
{
  "phases": [{
    "phase": string,
    "duration_months": number,
    "activities": [string],
    "drilling_meters": number,
    "cost_usd": number
  }],
  "total_cost_usd": number,
  "contingency_pct": number,
  "value_inflection_points": [string],
  "go_no_go_criteria": [string],
  "summary": string
}`;
  const usr = `Scope:\n${JSON.stringify(scope, null, 2)}\n\nContext:\n${JSON.stringify(context)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', phases: [] });
}

// ─────────────────────────────────────────────────────────────
// 12. geologist-shift-plan
// ─────────────────────────────────────────────────────────────
async function geologistShiftPlan(geologists = [], context = {}) {
  const sys = `${SYSTEM_PROMPT} Build a fly-in/fly-out rotational shift plan for exploration geologists. Return strict JSON:
{
  "rotation_pattern": string,
  "assignments": [{ "geo_id": string, "name": string, "property": string, "rotation_dates": string, "role": string }],
  "coverage_gaps": [{ "property": string, "issue": string, "fix": string }],
  "training_recommendations": [string],
  "summary": string
}`;
  const usr = `Geologists:\n${JSON.stringify(geologists, null, 2)}\n\nContext:\n${JSON.stringify(context)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', assignments: [] });
}

// ─────────────────────────────────────────────────────────────
// 13. geochem-pathfinder-detect
// ─────────────────────────────────────────────────────────────
async function geochemPathfinderDetect(samples = [], target = '') {
  const sys = `${SYSTEM_PROMPT} Identify pathfinder element associations in geochem data. Return strict JSON:
{
  "target_commodity": string,
  "pathfinder_elements": [{ "element": string, "rationale": string, "expected_co_occurrence": string }],
  "anomalous_samples": [{ "sample_id": string, "elements": [string], "score": number }],
  "deposit_model_hypotheses": [{ "model": string, "fit": "weak"|"moderate"|"strong", "evidence": string }],
  "recommended_followups": [string],
  "summary": string
}`;
  const usr = `Target commodity: ${target}\nSamples:\n${JSON.stringify(samples, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', pathfinder_elements: [] });
}

// ─────────────────────────────────────────────────────────────
// 14. geophysics-interpretation
// ─────────────────────────────────────────────────────────────
async function geophysicsInterpretation(survey = {}, context = {}) {
  const sys = `${SYSTEM_PROMPT} Interpret a geophysical survey dataset. Return strict JSON:
{
  "method": string,
  "anomalies": [{ "id": string, "type": string, "amplitude": string, "location": string, "depth_m": number, "interpretation": string }],
  "deposit_model_consistency": string,
  "follow_up_surveys": [string],
  "drill_targets_implied": [string],
  "summary": string
}`;
  const usr = `Survey:\n${JSON.stringify(survey, null, 2)}\n\nContext:\n${JSON.stringify(context)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', anomalies: [] });
}

// ─────────────────────────────────────────────────────────────
// 15. resource-statement-draft
// ─────────────────────────────────────────────────────────────
async function resourceStatementDraft(estimates = [], context = {}) {
  const sys = `${SYSTEM_PROMPT} Draft a Mineral Resource Statement (tabletop). Return strict JSON:
{
  "effective_date": string,
  "qp": string,
  "categories": [{ "category": string, "tonnes": number, "grade": number, "units": string, "contained_metal": number, "cutoff": string }],
  "modifying_factors": [string],
  "ndp_compliance_notes": [string],
  "disclaimer": string,
  "summary": string
}`;
  const usr = `Estimates:\n${JSON.stringify(estimates, null, 2)}\n\nContext:\n${JSON.stringify(context)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', categories: [] });
}

// ─────────────────────────────────────────────────────────────
// 16. jurisdictional-risk
// ─────────────────────────────────────────────────────────────
async function jurisdictionalRisk(country, propertyContext = {}) {
  const sys = `${SYSTEM_PROMPT} Score and narrate jurisdictional risk for a mining exploration property. Return strict JSON:
{
  "country": string,
  "overall_risk": "low"|"medium"|"high"|"critical",
  "drivers": [{ "category": "political"|"fiscal"|"social"|"security"|"environmental"|"infrastructure", "severity": "low"|"medium"|"high"|"critical", "narrative": string }],
  "regulatory_outlook_12mo": string,
  "mitigation_actions": [string],
  "go_no_go_recommendation": "go"|"caution"|"no_go",
  "summary": string
}`;
  const usr = `Country: ${country}\nProperty context:\n${JSON.stringify(propertyContext, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', drivers: [] });
}

// ─────────────────────────────────────────────────────────────
// 17. lithology-classify — classify geological log intervals
// ─────────────────────────────────────────────────────────────
async function lithologyClassify(logs = [], context = {}) {
  const sys = `${SYSTEM_PROMPT} Classify drill-log intervals into lithology + alteration tags + confidence. Return strict JSON:
{
  "classifications": [{
    "log_id": string,
    "hole_id": string,
    "from_m": number,
    "to_m": number,
    "primary_lithology": string,
    "secondary_lithology": string,
    "alteration_tags": [string],
    "structure_tags": [string],
    "confidence": number,
    "rationale": string
  }],
  "lithology_summary": [{ "lithology": string, "interval_count": number, "total_m": number }],
  "qaqc_flags": [string],
  "summary": string
}`;
  const usr = `Geological logs:\n${JSON.stringify(logs, null, 2)}\n\nContext:\n${JSON.stringify(context)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', classifications: [] });
}

// ─────────────────────────────────────────────────────────────
// 18. prospectivity-score — multi-signal property prospectivity
// ─────────────────────────────────────────────────────────────
async function prospectivityScore(signals = {}, context = {}) {
  const sys = `${SYSTEM_PROMPT} Compute a prospectivity score for a property using assay, geophysics, geochem and structural signals. Return strict JSON:
{
  "property": string,
  "score": number,
  "score_band": "low"|"moderate"|"high"|"very_high",
  "signal_contributions": [{ "signal": string, "weight": number, "evidence": string }],
  "deposit_model_candidates": [{ "model": string, "fit": "weak"|"moderate"|"strong" }],
  "recommended_next_steps": [string],
  "data_gaps": [string],
  "summary": string
}`;
  const usr = `Signals:\n${JSON.stringify(signals, null, 2)}\n\nContext:\n${JSON.stringify(context)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', signal_contributions: [] });
}

// ─────────────────────────────────────────────────────────────
// 19. resource-block-confidence — per-block Inferred/Indicated/Measured
// ─────────────────────────────────────────────────────────────
async function resourceBlockConfidence(estimates = [], context = {}) {
  const sys = `${SYSTEM_PROMPT} Assess per-block resource-category confidence. For each estimate block, return its NI 43-101 / JORC category with drivers. Return strict JSON:
{
  "property": string,
  "blocks": [{
    "estimate_id": string,
    "current_category": string,
    "assessed_category": "Inferred"|"Indicated"|"Measured",
    "confidence": number,
    "drivers": [{ "factor": string, "impact": "supports"|"weakens", "narrative": string }],
    "drill_spacing_assessment": string,
    "qaqc_assessment": string,
    "category_change_recommended": boolean,
    "rationale": string
  }],
  "category_rollup": [{ "category": string, "tonnes": number, "grade": number }],
  "qp_caveats": [string],
  "summary": string
}`;
  const usr = `Estimates:\n${JSON.stringify(estimates, null, 2)}\n\nContext:\n${JSON.stringify(context)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', blocks: [] });
}

// ─────────────────────────────────────────────────────────────
// 20. assay-anomaly-narrate — narrative report for an assay batch
// ─────────────────────────────────────────────────────────────
async function assayAnomalyNarrate(assays = [], context = {}) {
  const sys = `${SYSTEM_PROMPT} Generate a narrative anomaly report for a batch of assay results. Return strict JSON:
{
  "batch_label": string,
  "n_assays": number,
  "headline": string,
  "anomalies": [{
    "assay_id": string,
    "hole_id": string,
    "interval": string,
    "element": string,
    "value_ppm": number,
    "anomaly_class": "background"|"weakly_anomalous"|"anomalous"|"strongly_anomalous"|"bonanza",
    "narrative": string
  }],
  "elemental_associations": [{ "elements": [string], "pattern": string }],
  "drill_followup_suggestions": [string],
  "qaqc_concerns": [string],
  "narrative_report": string,
  "summary": string
}`;
  const usr = `Assay batch:\n${JSON.stringify(assays, null, 2)}\n\nContext:\n${JSON.stringify(context)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', anomalies: [] });
}

module.exports = {
  callOpenRouter,
  safeJsonParse,
  anomalyCluster,
  drillTargetRank,
  ndp43101Summary,
  assayTrend,
  execBrief,
  permitReadiness,
  environmentalRiskBrief,
  indigenousEngagementPlan,
  vendorQuoteCompare,
  partnerPitchDraft,
  explorationBudget,
  geologistShiftPlan,
  geochemPathfinderDetect,
  geophysicsInterpretation,
  resourceStatementDraft,
  jurisdictionalRisk,
  lithologyClassify,
  prospectivityScore,
  resourceBlockConfidence,
  assayAnomalyNarrate,
};
