const pool = require('../config/database');

class Level {
  static async getAll() {
    try {
      const query = 'SELECT id, name, description FROM levels';
      const [rows] = await pool.query(query);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async getByName(name) {
    try {
      const query = 'SELECT id, name, description FROM levels WHERE name = ?';
      const [rows] = await pool.query(query, [name]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Level;
