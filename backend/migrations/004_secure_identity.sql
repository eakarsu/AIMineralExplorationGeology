ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS tenant_id TEXT;
ALTER TABLE users ALTER COLUMN password DROP NOT NULL;
UPDATE users SET password = NULL WHERE password IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_tenant_email ON users (tenant_id, lower(email));
