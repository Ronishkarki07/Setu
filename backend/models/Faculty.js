const pool = require('../config/database');

class Faculty {
  static async getAll() {
    try {
      const query = 'SELECT id, name, description FROM faculties';
      const [rows] = await pool.query(query);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async getByName(name) {
    try {
      const query = 'SELECT id, name, description FROM faculties WHERE name = ?';
      const [rows] = await pool.query(query, [name]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Faculty;
