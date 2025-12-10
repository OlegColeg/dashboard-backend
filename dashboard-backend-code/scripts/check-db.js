// Simple DB check script for Postgres using project's .env
// Usage: node scripts/check-db.js

const { Client } = require('pg');
const path = require('path');
const fs = require('fs');

// Load .env manually (avoid adding dotenv to dependencies)
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const env = fs.readFileSync(envPath, 'utf8');
  env.split(/\r?\n/).forEach(line => {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) {
      const key = m[1];
      let val = m[2] || '';
      // remove surrounding quotes
      if ((val.startsWith("\"") && val.endsWith("\"")) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = process.env[key] || val;
    }
  });
}

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'dashboard_db',
});

(async () => {
  try {
    await client.connect();
    console.log('Connected to Postgres at', `${client.host}:${client.port}/${client.database}`);

    const resNow = await client.query('SELECT NOW()');
    console.log('Server time:', resNow.rows[0].now);

    // Check if users table exists and count rows
    const resTable = await client.query(
      `SELECT to_regclass('public.users') as table_name`);
    if (!resTable.rows[0].table_name) {
      console.log("Table 'users' does not exist in public schema.");
    } else {
      const resCount = await client.query('SELECT COUNT(*) as count FROM public.users');
      console.log("Table 'users' exists. Row count:", resCount.rows[0].count);
    }

    // Optional: list first 3 users
    try {
      const resSample = await client.query('SELECT * FROM public.users LIMIT 3');
      console.log('Sample rows:', resSample.rows);
    } catch (err) {
      console.log('Could not fetch sample rows:', err.message);
    }

    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('Failed to connect/query Postgres:', err.message);
    process.exit(2);
  }
})();
