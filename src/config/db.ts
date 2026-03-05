import mysql from 'mysql2/promise';
import { ENV } from './env.js';

const pool = mysql.createPool({
  host: ENV.DB_HOST,
  port: ENV.DB_PORT,
  user: ENV.DB_USER,
  password: ENV.DB_PASSWORD,
  database: ENV.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true,
});

// Initialize schema
export async function initSchema() {
  const conn = await pool.getConnection();
  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        username VARCHAR(255) NOT NULL UNIQUE,
        email_verified TINYINT(1) DEFAULT 0,
        verification_token VARCHAR(255),
        verification_expires DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        reset_token VARCHAR(255),
        reset_expires DATETIME
      );
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        mobile VARCHAR(50) DEFAULT '',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        deleted_at DATETIME DEFAULT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT NOT NULL,
        user_id INT NOT NULL,
        type ENUM('GAVE', 'GOT') NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        description TEXT,
        date DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        deleted_at DATETIME DEFAULT NULL,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS admin_config (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL
      );
    `);

    // Add columns if they do not exist (for existing databases)
    try { await conn.query('ALTER TABLE users ADD COLUMN reset_token VARCHAR(255);'); } catch (e) { /* ignore if exists */ }
    try { await conn.query('ALTER TABLE users ADD COLUMN reset_expires DATETIME;'); } catch (e) { /* ignore if exists */ }
    try { await conn.query('ALTER TABLE customers ADD COLUMN deleted_at DATETIME DEFAULT NULL;'); } catch (e) { /* ignore if exists */ }
    try { await conn.query('ALTER TABLE transactions ADD COLUMN deleted_at DATETIME DEFAULT NULL;'); } catch (e) { /* ignore if exists */ }

    // Create Indexes for performance
    try { await conn.query('CREATE INDEX idx_customers_user_id ON customers(user_id);'); } catch (e) { /* ignore if exists */ }
    try { await conn.query('CREATE INDEX idx_transactions_user_id ON transactions(user_id);'); } catch (e) { /* ignore if exists */ }
    try { await conn.query('CREATE INDEX idx_transactions_customer_id ON transactions(customer_id);'); } catch (e) { /* ignore if exists */ }
    try { await conn.query('CREATE INDEX idx_transactions_date ON transactions(date);'); } catch (e) { /* ignore if exists */ }

    // Insert default admin if not exists
    const [rows]: any = await conn.query('SELECT COUNT(*) as cnt FROM admin_config');
    if (rows[0].cnt === 0) {
      const bcrypt = await import('bcryptjs');
      const hash = await bcrypt.hash('password', 10);
      await conn.query('INSERT INTO admin_config (username, password_hash) VALUES (?, ?)', ['admin', hash]);
    }

    console.log('[MySQL] Schema initialized with new columns and indexes');
  } catch (err) {
    console.error('[MySQL] Schema initialization failed:', err);
    throw err;
  } finally {
    conn.release();
  }
}

export async function query(sql: string, params?: any[]): Promise<any> {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

export { pool };
export default pool;
