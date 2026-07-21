BEGIN;
CREATE TABLE IF NOT EXISTS exploration_workflows (
 id BIGSERIAL PRIMARY KEY, tenant_id TEXT NOT NULL, program_ref TEXT NOT NULL, property_ref TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'proposed', rule_version TEXT NOT NULL, geology_model_version TEXT NOT NULL,
 coordinate_system TEXT NOT NULL, idempotency_key TEXT NOT NULL, created_by TEXT NOT NULL,
 failure_code TEXT, recovery_plan JSONB, version INTEGER NOT NULL DEFAULT 1, created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(tenant_id,program_ref), UNIQUE(tenant_id,idempotency_key)
);
CREATE TABLE IF NOT EXISTS exploration_target_evidence (
 id BIGSERIAL PRIMARY KEY, tenant_id TEXT NOT NULL, program_ref TEXT NOT NULL, target_ref TEXT NOT NULL,
 latitude NUMERIC(10,7) NOT NULL, longitude NUMERIC(10,7) NOT NULL, planned_depth_m NUMERIC(12,3) NOT NULL,
 source_ref TEXT NOT NULL, source_version TEXT NOT NULL, checksum TEXT NOT NULL, captured_at TIMESTAMPTZ NOT NULL,
 UNIQUE(tenant_id,program_ref,target_ref,source_ref,source_version)
);
CREATE TABLE IF NOT EXISTS exploration_sample_custody (
 id BIGSERIAL PRIMARY KEY, tenant_id TEXT NOT NULL, program_ref TEXT NOT NULL, sample_ref TEXT NOT NULL,
 sequence INTEGER NOT NULL, action TEXT NOT NULL, actor_ref TEXT NOT NULL, occurred_at TIMESTAMPTZ NOT NULL,
 custody_checksum TEXT NOT NULL, assay_certificate_checksum TEXT, UNIQUE(tenant_id,sample_ref,sequence)
);
CREATE TABLE IF NOT EXISTS exploration_execution_deliveries (
 id BIGSERIAL PRIMARY KEY, tenant_id TEXT NOT NULL, program_ref TEXT NOT NULL, provider TEXT NOT NULL,
 idempotency_key TEXT NOT NULL, payload_checksum TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending', receipt TEXT,
 attempts INTEGER NOT NULL DEFAULT 0, next_attempt_at TIMESTAMPTZ, last_error TEXT,
 UNIQUE(tenant_id,provider,idempotency_key)
);
CREATE TABLE IF NOT EXISTS exploration_workflow_audit (
 id BIGSERIAL PRIMARY KEY, tenant_id TEXT NOT NULL, program_ref TEXT NOT NULL, from_status TEXT, to_status TEXT NOT NULL,
 actor_id TEXT NOT NULL, actor_role TEXT NOT NULL, reason TEXT NOT NULL, permit_reference TEXT,
 evidence JSONB NOT NULL DEFAULT '{}'::jsonb, correlation_id TEXT NOT NULL, occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_exploration_delivery_retry ON exploration_execution_deliveries(status,next_attempt_at);
CREATE UNIQUE INDEX IF NOT EXISTS uq_exploration_audit_correlation ON exploration_workflow_audit(tenant_id,program_ref,correlation_id);
COMMIT;
