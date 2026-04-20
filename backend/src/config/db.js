const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function connectDB() {
  const client = await pool.connect();
  await client.query(`
    CREATE TABLE IF NOT EXISTS reports (
      id SERIAL PRIMARY KEY,
      ngo_id VARCHAR(100) NOT NULL,
      month VARCHAR(7) NOT NULL,
      people_helped INTEGER NOT NULL,
      events_conducted INTEGER NOT NULL,
      funds_utilized NUMERIC(14, 2) NOT NULL,
      region VARCHAR(100),
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(ngo_id, month)
    );

    CREATE TABLE IF NOT EXISTS jobs (
      id VARCHAR(36) PRIMARY KEY,
      status VARCHAR(20) DEFAULT 'pending',
      total INTEGER DEFAULT 0,
      processed INTEGER DEFAULT 0,
      failed INTEGER DEFAULT 0,
      errors JSONB DEFAULT '[]',
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
  await client.query(`
    ALTER TABLE reports ADD COLUMN IF NOT EXISTS region VARCHAR(100);
  `);
  client.release();
  console.log('PostgreSQL connected');
}

module.exports = { pool, connectDB };
