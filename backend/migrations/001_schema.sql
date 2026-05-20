-- AI Mineral Exploration Geology — base schema (entities 1-18)

-- 1. properties
CREATE TABLE IF NOT EXISTS properties (
  id                SERIAL PRIMARY KEY,
  property_id       VARCHAR(50) UNIQUE,
  name              VARCHAR(200) NOT NULL,
  country           VARCHAR(80),
  area_km2          NUMERIC(12,2) DEFAULT 0,
  commodity_target  VARCHAR(120),
  status            VARCHAR(30) DEFAULT 'active',
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- 2. claims
CREATE TABLE IF NOT EXISTS claims (
  id                SERIAL PRIMARY KEY,
  claim_id          VARCHAR(50) UNIQUE,
  property_id       VARCHAR(50),
  claim_number      VARCHAR(120),
  area_ha           NUMERIC(12,2) DEFAULT 0,
  expires_at        DATE,
  status            VARCHAR(30) DEFAULT 'in_good_standing',
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- 3. drill_holes
CREATE TABLE IF NOT EXISTS drill_holes (
  id                SERIAL PRIMARY KEY,
  hole_id           VARCHAR(50) UNIQUE,
  property_id       VARCHAR(50),
  collar_e          NUMERIC(12,2),
  collar_n          NUMERIC(12,2),
  depth_m           NUMERIC(8,2) DEFAULT 0,
  status            VARCHAR(30) DEFAULT 'planned',
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- 4. assay_results
CREATE TABLE IF NOT EXISTS assay_results (
  id                SERIAL PRIMARY KEY,
  assay_id          VARCHAR(50) UNIQUE,
  hole_id           VARCHAR(50),
  from_m            NUMERIC(8,2),
  to_m              NUMERIC(8,2),
  element           VARCHAR(20),
  value_ppm         NUMERIC(14,4),
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- 5. geophysics_surveys
CREATE TABLE IF NOT EXISTS geophysics_surveys (
  id                SERIAL PRIMARY KEY,
  survey_id         VARCHAR(50) UNIQUE,
  property_id       VARCHAR(50),
  method            VARCHAR(80),
  vendor            VARCHAR(150),
  completed_at      DATE,
  status            VARCHAR(30) DEFAULT 'planned',
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- 6. geochem_samples
CREATE TABLE IF NOT EXISTS geochem_samples (
  id                SERIAL PRIMARY KEY,
  sample_id         VARCHAR(50) UNIQUE,
  property_id       VARCHAR(50),
  type              VARCHAR(60),
  location          VARCHAR(200),
  taken_at          DATE,
  status            VARCHAR(30) DEFAULT 'pending',
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- 7. geological_logs
CREATE TABLE IF NOT EXISTS geological_logs (
  id                SERIAL PRIMARY KEY,
  log_id            VARCHAR(50) UNIQUE,
  hole_id           VARCHAR(50),
  from_m            NUMERIC(8,2),
  to_m              NUMERIC(8,2),
  lithology         VARCHAR(150),
  structure         VARCHAR(200),
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- 8. geologists
CREATE TABLE IF NOT EXISTS geologists (
  id                SERIAL PRIMARY KEY,
  geo_id            VARCHAR(50) UNIQUE,
  name              VARCHAR(150),
  specialty         VARCHAR(120),
  base              VARCHAR(120),
  status            VARCHAR(30) DEFAULT 'active',
  contact           VARCHAR(150),
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- 9. contractors
CREATE TABLE IF NOT EXISTS contractors (
  id                SERIAL PRIMARY KEY,
  contractor_id     VARCHAR(50) UNIQUE,
  name              VARCHAR(150),
  service           VARCHAR(120),
  country           VARCHAR(80),
  rate_usd_day      NUMERIC(12,2) DEFAULT 0,
  status            VARCHAR(30) DEFAULT 'approved',
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- 10. samples_inventory
CREATE TABLE IF NOT EXISTS samples_inventory (
  id                SERIAL PRIMARY KEY,
  inv_id            VARCHAR(50) UNIQUE,
  sample_id         VARCHAR(50),
  location          VARCHAR(200),
  qa_status         VARCHAR(30) DEFAULT 'pending',
  sent_to           VARCHAR(150),
  ts                TIMESTAMPTZ,
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- 11. permits
CREATE TABLE IF NOT EXISTS permits (
  id                SERIAL PRIMARY KEY,
  permit_id         VARCHAR(50) UNIQUE,
  property_id       VARCHAR(50),
  authority         VARCHAR(150),
  type              VARCHAR(80),
  status            VARCHAR(30) DEFAULT 'pending',
  issued_at         DATE,
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- 12. environmental_impacts
CREATE TABLE IF NOT EXISTS environmental_impacts (
  id                SERIAL PRIMARY KEY,
  impact_id         VARCHAR(50) UNIQUE,
  property_id       VARCHAR(50),
  type              VARCHAR(80),
  severity          VARCHAR(20) DEFAULT 'low',
  opened_at         DATE,
  status            VARCHAR(30) DEFAULT 'open',
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- 13. indigenous_consultations
CREATE TABLE IF NOT EXISTS indigenous_consultations (
  id                SERIAL PRIMARY KEY,
  consult_id        VARCHAR(50) UNIQUE,
  property_id       VARCHAR(50),
  community         VARCHAR(200),
  type              VARCHAR(80),
  status            VARCHAR(30) DEFAULT 'open',
  ts                TIMESTAMPTZ,
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- 14. drill_targets
CREATE TABLE IF NOT EXISTS drill_targets (
  id                SERIAL PRIMARY KEY,
  target_id         VARCHAR(50) UNIQUE,
  property_id       VARCHAR(50),
  name              VARCHAR(200),
  target_type       VARCHAR(80),
  priority          VARCHAR(20) DEFAULT 'medium',
  status            VARCHAR(30) DEFAULT 'proposed',
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- 15. ndp_resource_estimates  (NI 43-101)
CREATE TABLE IF NOT EXISTS ndp_resource_estimates (
  id                SERIAL PRIMARY KEY,
  estimate_id       VARCHAR(50) UNIQUE,
  property_id       VARCHAR(50),
  category          VARCHAR(40),
  tonnes            NUMERIC(18,2) DEFAULT 0,
  grade             NUMERIC(12,4) DEFAULT 0,
  ndp_compliant     BOOLEAN DEFAULT TRUE,
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- 16. expense_reports
CREATE TABLE IF NOT EXISTS expense_reports (
  id                SERIAL PRIMARY KEY,
  expense_id        VARCHAR(50) UNIQUE,
  property_id       VARCHAR(50),
  category          VARCHAR(80),
  amount_usd        NUMERIC(14,2) DEFAULT 0,
  period            VARCHAR(40),
  status            VARCHAR(30) DEFAULT 'recorded',
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- 17. partners
CREATE TABLE IF NOT EXISTS partners (
  id                SERIAL PRIMARY KEY,
  partner_id        VARCHAR(50) UNIQUE,
  name              VARCHAR(200),
  type              VARCHAR(80),
  ownership_pct     NUMERIC(6,2) DEFAULT 0,
  contact           VARCHAR(200),
  status            VARCHAR(30) DEFAULT 'active',
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- 18. audit_log
CREATE TABLE IF NOT EXISTS audit_log (
  id                SERIAL PRIMARY KEY,
  entry_id          VARCHAR(50) UNIQUE,
  actor             VARCHAR(150),
  target            VARCHAR(200),
  action            VARCHAR(80),
  result            VARCHAR(60),
  ts                TIMESTAMPTZ DEFAULT NOW(),
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ai_results (history persistence)
CREATE TABLE IF NOT EXISTS ai_results (
  id              SERIAL PRIMARY KEY,
  feature         VARCHAR(80) NOT NULL,
  input           JSONB,
  output          JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ai_results_feature_created
  ON ai_results (feature, created_at DESC);

-- Cross-cutting: users / notifications / attachments / webhooks
CREATE TABLE IF NOT EXISTS users (
  id              SERIAL PRIMARY KEY,
  email           VARCHAR(150) UNIQUE NOT NULL,
  password        VARCHAR(120) NOT NULL,
  name            VARCHAR(120),
  role            VARCHAR(20) DEFAULT 'viewer',  -- admin|geologist|viewer
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER,
  title           VARCHAR(200),
  body            TEXT,
  severity        VARCHAR(20) DEFAULT 'info',
  source          VARCHAR(80),
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON notifications (user_id, read_at);

CREATE TABLE IF NOT EXISTS attachments (
  id              SERIAL PRIMARY KEY,
  resource_type   VARCHAR(60),
  resource_id     INTEGER,
  filename        VARCHAR(255),
  original_name   VARCHAR(255),
  mimetype        VARCHAR(120),
  size_bytes      INTEGER,
  uploaded_by     VARCHAR(150),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_attachments_resource
  ON attachments (resource_type, resource_id);

CREATE TABLE IF NOT EXISTS webhooks (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(120),
  url             VARCHAR(500),
  secret          VARCHAR(120),
  events          TEXT,
  active          BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id              SERIAL PRIMARY KEY,
  webhook_id      INTEGER,
  event           VARCHAR(120),
  payload         JSONB,
  status_code     INTEGER,
  response_body   TEXT,
  attempted_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook
  ON webhook_deliveries (webhook_id, attempted_at DESC);
