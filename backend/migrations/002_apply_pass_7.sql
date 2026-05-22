-- Apply pass 7 — backlog implementation
-- Adds:
--   - claim_ledger: immutable claim transfer / status-change ledger
--   - block_models: coarse 3D block-model grids (per property) for 3D viz

CREATE TABLE IF NOT EXISTS claim_ledger (
  id              SERIAL PRIMARY KEY,
  ledger_id       VARCHAR(50) UNIQUE,
  claim_id        VARCHAR(50) NOT NULL,
  property_id     VARCHAR(50),
  event_type      VARCHAR(40) NOT NULL,  -- transfer|status_change|renewal|surrender|stake|amendment
  from_party      VARCHAR(200),
  to_party        VARCHAR(200),
  prev_status     VARCHAR(40),
  next_status     VARCHAR(40),
  effective_date  DATE,
  reference       VARCHAR(200),
  recorded_by     VARCHAR(150),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_claim_ledger_claim    ON claim_ledger (claim_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_claim_ledger_property ON claim_ledger (property_id, created_at DESC);

CREATE TABLE IF NOT EXISTS block_models (
  id              SERIAL PRIMARY KEY,
  model_id        VARCHAR(50) UNIQUE,
  property_id     VARCHAR(50) NOT NULL,
  commodity       VARCHAR(40),
  nx              INTEGER NOT NULL,
  ny              INTEGER NOT NULL,
  nz              INTEGER NOT NULL,
  origin_e        NUMERIC(14,2) DEFAULT 0,
  origin_n        NUMERIC(14,2) DEFAULT 0,
  origin_z        NUMERIC(14,2) DEFAULT 0,
  block_size_m    NUMERIC(8,2) DEFAULT 25,
  -- voxel grade grid stored as nested JSON arrays: nz[ny[nx[ value_ppm ]]]
  grid            JSONB,
  source          VARCHAR(80),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_block_models_property ON block_models (property_id);
