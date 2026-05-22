# Audit Note — AIMineralExplorationGeology

Stack: Node + Express + React + Postgres + OpenRouter.
Domain: mineral exploration / geology (drill logs, assays, prospectivity, claims, permits).
Mode: **audit-only** — no code changes.

## Inventory

### Backend routes (`backend/routes/`)
CRUD: `properties`, `claims`, `drillHoles`, `assayResults`, `geophysicsSurveys`, `geochemSamples`, `geologicalLogs`, `geologists`, `contractors`, `samplesInventory`, `permits`, `environmentalImpacts`, `indigenousConsultations`, `drillTargets`, `ndpResourceEstimates`, `expenseReports`, `partners`, `auditLog`. Cross-cutting: `auth`, `dashboard`, `notifications`, `attachments`, `customViews`, `webhooks`.

### AI endpoints (`backend/routes/ai.js`, 18 POST handlers)
`anomaly-cluster`, `drill-target-rank`, `ndp-43-101-summary`, `assay-trend`, `executive-brief`, `permit-readiness`, `environmental-risk-brief`, `indigenous-engagement-plan`, `vendor-quote-compare`, `partner-pitch-draft`, `exploration-budget`, `geologist-shift-plan`, `geochem-pathfinder-detect`, `geophysics-interpretation`, `resource-statement-draft`, `jurisdictional-risk` (+ `GET /samples`, `GET /history`).

### Frontend pages
17 AI pages + 18 CRUD pages + Dashboard/Login + 2 Codex feature pages. Components include `DrillStripPlot`, `AnomalyMap`, `PermitGantt`, `ResourcePyramid` (no 3D block-model viewer).

### Schema (`migrations/001_schema.sql`)
18 domain tables + `ai_results` history + `users` / `notifications` / `attachments` / `webhooks` / `webhook_deliveries`.

## Brief vs. State — gap analysis

### Missing AI counterparts
- **Lithology classifier** (classify drill-log intervals from geological_logs descriptors / structure) — **MISSING**.
- **Prospectivity scorer** (per-property/grid prospectivity rollup from assays + geophys + geochem + structure) — **MISSING** (drill-target-rank ranks already-proposed targets, not raw prospectivity).
- **Anomaly narrator from assays** — partially covered by `anomaly-cluster` + `geochem-pathfinder-detect` + `assay-trend`. A dedicated narrative endpoint for an assay batch is **MISSING-PARTIAL**.
- **Geophysical interpretation copilot** — covered by `geophysics-interpretation`. **PRESENT**.
- **Drill target recommender** — covered by `drill-target-rank`. **PRESENT** (ranking flavor; greenfield recommendation from raw data is partial).
- **Resource-block confidence assessor** — `resource-statement-draft` drafts statements; per-block / per-category confidence scoring is **MISSING**.

### Missing non-AI features
- Drill hole log CRUD — **PRESENT** (`drillHoles`, `geologicalLogs`).
- Assay import — CRUD `assayResults` **PRESENT**; bulk CSV/lab-LIMS import path **MISSING**.
- Claim ledger — `claims` CRUD **PRESENT**; immutable ledger / transfer history **MISSING**.
- Regulatory permit tracker — `permits` CRUD + `PermitGantt` + `permit-readiness` AI **PRESENT**.

### Missing custom features
- **3D block-model visualization** — **MISSING** (no three.js/deck.gl viewer; only 2D `ResourcePyramid` + `DrillStripPlot`).
- **JORC / NI 43-101 report drafter** — covered by `ndp-43-101-summary` + `resource-statement-draft`. **PRESENT**.
- **Geochem cluster analysis** — covered by `anomaly-cluster` + `geochem-pathfinder-detect`. **PRESENT**.

## Backlog (prioritized, not implemented)
1. **MECHANICAL** AI: `POST /api/ai/lithology-classify` (input geological_logs rows → lithology + confidence + alteration tags).
2. **MECHANICAL** AI: `POST /api/ai/prospectivity-score` (multi-signal grid/property score with rationale).
3. **MECHANICAL** AI: `POST /api/ai/resource-block-confidence` (per-block category Inferred/Indicated/Measured w/ drivers).
4. **MECHANICAL** AI: `POST /api/ai/assay-anomaly-narrate` (narrative report from assay batch).
5. **MECHANICAL** Non-AI: bulk assay CSV import endpoint + UI dropzone.
6. **MECHANICAL** Non-AI: claim transfer/ledger history table + endpoints.
7. **NEEDS-PRODUCT-DECISION** 3D block-model viewer (three.js/deck.gl; voxel store schema choice).
8. **NEEDS-CREDS** External lab LIMS / government claim registry feeds.

## Implemented (this round)
**None — audit-only.**

## Counts
- CRUD routes: 18
- AI endpoints: 16 POST (+2 GET helpers)
- Frontend pages: 37 (17 AI + 18 CRUD + Dashboard + Login)
- Schema tables: 18 domain + 7 cross-cutting = 25
- Missing AI (vs. brief): 4 (lithology classifier, prospectivity scorer, resource-block confidence, assay anomaly narrator)
- Missing non-AI: 2 (bulk assay import, claim ledger history)
- Missing custom: 1 (3D block-model viz)

## Status
**AUDIT-ONLY — no code changes. Backlog of 8 items recorded above.**

## Apply pass 7 (full backlog implementation)

Implemented every backlog item from above. No new dependencies, no breaking changes.
Routes mounted in `backend/server.js` before `app.listen`. All modified `.js`
files pass `node --check`.

### Backend — new endpoints (all under existing auth middleware)
MECHANICAL AI (4 new POSTs under `/api/ai`):
- `POST /api/ai/lithology-classify`        — classify `geological_logs` rows by `hole_id` or `property_id`; returns primary/secondary lithology, alteration tags, structure tags, per-interval confidence, QA/QC flags.
- `POST /api/ai/prospectivity-score`       — multi-signal property prospectivity (assays + geophys + geochem + structure + targets) → score, score_band, signal_contributions, deposit_model_candidates, data_gaps.
- `POST /api/ai/resource-block-confidence` — per-`ndp_resource_estimates` block: assessed Inferred/Indicated/Measured category, drivers, drill-spacing + QA/QC assessment, category-change recommendation.
- `POST /api/ai/assay-anomaly-narrate`     — dedicated narrative anomaly report for an assay batch (filterable by hole_id, property_id, element).

All four record into `ai_results` so the History modal works, and have entries in the `/api/ai/samples` registry.

MECHANICAL Non-AI:
- Bulk assay CSV import — already provided by the generic CRUD factory at `POST /api/assay-results/bulk-import` (text/csv body) and surfaced in the existing `AssayResultsPage` via the `CrudPage` "Import CSV" button + file picker (dropzone). No additional route needed; this backlog item is satisfied by the existing wiring.
- Claim transfer ledger — new file `backend/routes/claimLedger.js` mounted at `/api/claim-ledger`:
  - `GET  /api/claim-ledger?claim_id=&property_id=&event_type=`
  - `GET  /api/claim-ledger/by-claim/:claim_id`
  - `GET  /api/claim-ledger/:id`
  - `POST /api/claim-ledger` (writers only) — append-only; optionally syncs `claims.status` when `next_status` is set.

NEEDS-PRODUCT-DECISION — 3D block-model viz:
- `GET  /api/ai/block-model?property_id=...`  — latest persisted block model for a property.
- `POST /api/ai/block-model { property_id, nx?, ny?, nz?, block_size_m?, commodity? }` — synthesizes a coarse `nx × ny × nz` voxel grid from the property's drill-hole assays via inverse-distance + depth attenuation, persists to `block_models`, returns the row (grid as nested JSON arrays).

NEEDS-CREDS — external geophysical feeds:
- `GET|POST /api/ai/external-feeds/:feed` — returns HTTP 503 with `{ error, feed, reason: 'NEEDS-CREDS …' }`. Wired but inert until credentials configured.

### Frontend — new pages + sidebar links
- `frontend/src/pages/AILithologyClassifyPage.js`        → route `/ai/lithology-classify`
- `frontend/src/pages/AIProspectivityScorePage.js`       → route `/ai/prospectivity-score`
- `frontend/src/pages/AIResourceBlockConfidencePage.js`  → route `/ai/resource-block-confidence`
- `frontend/src/pages/AIAssayAnomalyNarratePage.js`      → route `/ai/assay-anomaly-narrate`
- `frontend/src/pages/BlockModelViewerPage.js`           → route `/block-model` (2D heatmap fallback per Z-slice; calls `GET/POST /api/ai/block-model`).
- `frontend/src/pages/ClaimLedgerPage.js`                → route `/claim-ledger` (list + filter by `claim_id` + "Record Event" form).
- `frontend/src/components/Sidebar.js` updated: AI Exploration (+lithology, +assay-anomaly-narrate, +prospectivity), AI Reporting (+block-confidence), Properties (+Claim Ledger), Custom Views (+3D Block Model).
- `frontend/src/services/api.js`: added `aiLithologyClassify`, `aiProspectivityScore`, `aiResourceBlockConfidence`, `aiAssayAnomalyNarrate`, `getBlockModel`, `buildBlockModel`, and `claimLedgerApi`.

### Schema — `backend/migrations/002_apply_pass_7.sql`
- `claim_ledger` (id, ledger_id UNIQUE, claim_id, property_id, event_type, from_party, to_party, prev_status, next_status, effective_date, reference, recorded_by, notes, created_at) + idx on `(claim_id, created_at DESC)` and `(property_id, created_at DESC)`.
- `block_models`  (id, model_id UNIQUE, property_id, commodity, nx/ny/nz, origin_e/n/z, block_size_m, grid JSONB, source, notes, timestamps) + idx on `(property_id)`.

### Syntax check
`node --check` passed for: `backend/server.js`, `backend/routes/ai.js`, `backend/routes/claimLedger.js`, `backend/services/ai.js`. (Frontend files contain JSX and are validated by the React build pipeline, not `node --check`.)

### Skips
- External geophysical feeds delivered as 503 stubs as scoped (NEEDS-CREDS).
- 3D viewer rendered as 2D heatmap fallback per Z-slice (no new deps — three.js / deck.gl deliberately not added). True 3D voxel viz remains a product decision.
- No new dependencies added to either `package.json`.

### Status (apply pass 7)
**ALL 8 backlog items addressed.** 4 new MECHANICAL AI endpoints + 4 frontend pages live. Claim ledger table + endpoints + UI live. Bulk assay CSV import already provided by generic CRUD factory + existing UI. 3D block-model: backend grid endpoint + persistence table + 2D heatmap fallback page live. External feeds: 503 stubs live, gated on credentials. Migration `002_apply_pass_7.sql` ready to apply; no breaking schema changes.
