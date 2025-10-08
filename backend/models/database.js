const { Pool } = require('pg');

class Database {
  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST || '198.199.69.39',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'webinar_bridge',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  async connect() {
    try {
      const client = await this.pool.connect();
      console.log('✅ Connected to PostgreSQL database');
      console.log(`🔗 Host: ${this.pool.options.host}:${this.pool.options.port}`);
      console.log(`📊 Database: ${this.pool.options.database}`);
      client.release();
      return Promise.resolve();
    } catch (err) {
      console.error('❌ Database connection error:', err.message);
      console.error('🔧 Connection details:');
      console.error(`   Host: ${this.pool.options.host}:${this.pool.options.port}`);
      console.error(`   Database: ${this.pool.options.database}`);
      console.error(`   User: ${this.pool.options.user}`);
      console.error('💡 Please check:');
      console.error('   - Database server is running');
      console.error('   - Database exists');
      console.error('   - Credentials are correct');
      console.error('   - Network connectivity');
      throw err;
    }
  }

  async query(sql, params = []) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(sql, params);
      return result;
    } catch (err) {
      console.error('Database query error:', err.message);
      console.error('SQL:', sql);
      console.error('Params:', params);
      throw err;
    } finally {
      client.release();
    }
  }

  async run(sql, params = []) {
    const result = await this.query(sql, params);
    return { 
      id: result.rows[0]?.id || null, 
      changes: result.rowCount,
      rows: result.rows 
    };
  }

  async get(sql, params = []) {
    const result = await this.query(sql, params);
    return result.rows[0] || null;
  }

  async all(sql, params = []) {
    const result = await this.query(sql, params);
    return result.rows;
  }

  async close() {
    try {
      await this.pool.end();
      console.log('✅ Database connection pool closed');
    } catch (err) {
      console.error('❌ Error closing database pool:', err.message);
      throw err;
    }
  }
}

// Create singleton instance
const database = new Database();

// Initialize database connection
database.connect().catch(console.error);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Closing database connection...');
  await database.close();
  process.exit(0);
});

module.exports = database;