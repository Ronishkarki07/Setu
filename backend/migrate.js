// Run: node migrate.js
const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
  const pool = await mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3307,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'helpdesk_db',
  });

  try {
    await pool.query(`ALTER TABLE students ADD COLUMN IF NOT EXISTS department VARCHAR(255) NULL`);
    console.log('✅ Added department column to students');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS ticket_comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ticket_id INT NOT NULL,
        author_id INT NOT NULL,
        author_name VARCHAR(255) NOT NULL,
        author_role ENUM('student', 'department_head', 'admin') DEFAULT 'student',
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Created ticket_comments table');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        audience ENUM('all', 'students', 'staff') DEFAULT 'all',
        is_emergency BOOLEAN DEFAULT FALSE,
        created_by VARCHAR(255) DEFAULT 'Admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Ensured announcements table exists');

    console.log('🎉 Migration complete');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration error:', err.message);
    process.exit(1);
  }
}

migrate();
