#!/usr/bin/env node
require('dotenv').config({ path: require('path').join(__dirname, '../backend/.env') });
let bcrypt;
try {
  // Try to resolve from backend's node_modules when run from repo root
  bcrypt = require('bcryptjs');
} catch (e) {
  try {
    bcrypt = require('../backend/node_modules/bcryptjs');
  } catch (e2) {
    console.error('Cannot load bcryptjs. Ensure you ran npm install in backend/.');
    process.exit(1);
  }
}
const { Pool } = require('pg');

// Database configuration
const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'webinar_bridge',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function createDefaultUser() {
  try {
    // Hash the password
    const password = 'CiR43Tx2-';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log('🔐 Creating default admin user...');
    console.log('Email: ryan@thecashflowacademy.com');
    console.log('Password: CiR43Tx2-');
    console.log('Hash:', hashedPassword);
    
    // Insert the user
    const result = await pool.query(
      `INSERT INTO users (email, password, name) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (email) DO UPDATE SET 
       password = EXCLUDED.password,
       name = EXCLUDED.name
       RETURNING id`,
      ['ryan@thecashflowacademy.com', hashedPassword, 'Ryan Bradshaw']
    );
    
    console.log('✅ Default admin user created successfully');
    console.log('User ID:', result.rows[0].id);
    
  } catch (error) {
    console.error('❌ Error creating default user:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

createDefaultUser().catch(console.error);