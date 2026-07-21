const pool = require('../config/database');
const { hashPassword } = require('../services/passwords');

async function main() {
  if (process.env.BOOTSTRAP_ACKNOWLEDGEMENT !== 'create-initial-admin') {
    throw new Error('BOOTSTRAP_ACKNOWLEDGEMENT=create-initial-admin is required');
  }
  const email = (process.env.PROVISION_ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.PROVISION_ADMIN_PASSWORD || '';
  const name = (process.env.PROVISION_ADMIN_NAME || '').trim();
  const tenantId = (process.env.TENANT_ID || '').trim();
  if (!email || !name || !tenantId || password.length < 14) {
    throw new Error('Admin email, name, tenant, and a 14+ character password are required');
  }
  const existing = await pool.query('SELECT id FROM users WHERE lower(email) = $1', [email]);
  if (existing.rows.length) {
    console.log('Initial admin already exists; credentials were not changed.');
    return;
  }
  const passwordHash = await hashPassword(password);
  await pool.query(
    'INSERT INTO users (email, password, password_hash, name, role, tenant_id) VALUES ($1, NULL, $2, $3, $4, $5)',
    [email, passwordHash, name, 'admin', tenantId]
  );
  console.log('Initial admin created.');
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
}).finally(() => pool.end());
