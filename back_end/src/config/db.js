const { Pool } = require('pg');
require('dotenv').config();

// Create a connection pool using variables from your .env file
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Test the connection instantly when the server boots
pool.connect((err, client, release) => {
  if (err) {
    return console.error('❌ Database connection error:', err.stack);
  }
  console.log('✅ Connected successfully to local PostgreSQL (bari_incidents)!');
  release();
});

module.exports = pool;