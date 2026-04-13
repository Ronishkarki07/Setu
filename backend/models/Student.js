const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class Student {
  // Create a new student
  static async create({ name, email, faculty, level, password }) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const query = `
        INSERT INTO students (name, email, faculty, level, password)
        VALUES (?, ?, ?, ?, ?)
      `;
      
      const [result] = await pool.query(query, [name, email, faculty, level, hashedPassword]);
      return { id: result.insertId, name, email, faculty, level };
    } catch (error) {
      throw error;
    }
  }

  // Find student by email
  static async findByEmail(email) {
    try {
      const query = 'SELECT * FROM students WHERE email = ?';
      const [rows] = await pool.query(query, [email]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Find student by ID
  static async findById(id) {
    try {
      const query = 'SELECT id, name, email, faculty, level, is_active, created_at, last_login, profile_photo FROM students WHERE id = ?';
      const [rows] = await pool.query(query, [id]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Validate password
  static async validatePassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      throw error;
    }
  }

  // Update last login
  static async updateLastLogin(id) {
    try {
      const query = 'UPDATE students SET last_login = CURRENT_TIMESTAMP WHERE id = ?';
      await pool.query(query, [id]);
    } catch (error) {
      throw error;
    }
  }

  // Get all students
  static async getAll() {
    try {
      const query = 'SELECT id, name, email, faculty, level, is_active, created_at, profile_photo FROM students';
      const [rows] = await pool.query(query);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get students by faculty
  static async getByFaculty(faculty) {
    try {
      const query = 'SELECT id, name, email, faculty, level, is_active FROM students WHERE faculty = ?';
      const [rows] = await pool.query(query, [faculty]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Store OTP (stored forever for account recovery)
  static async storeOTP(email, otp) {
    try {
      const query = `
        UPDATE students 
        SET otp = ?
        WHERE email = ?
      `;
      await pool.query(query, [otp, email]);
    } catch (error) {
      throw error;
    }
  }

  // Verify OTP (no expiration - stored permanently)
  static async verifyOTP(email, otp) {
    try {
      const query = `
        SELECT otp FROM students 
        WHERE email = ? AND otp = ?
      `;
      const [rows] = await pool.query(query, [email, otp]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Mark email as verified (keep OTP for future account recovery)
  static async markEmailAsVerified(email) {
    try {
      const query = `
        UPDATE students 
        SET is_verified = true
        WHERE email = ?
      `;
      await pool.query(query, [email]);
    } catch (error) {
      throw error;
    }
  }

  // Update profile photo
  static async updateProfilePhoto(id, photoPath) {
    try {
      const query = 'UPDATE students SET profile_photo = ? WHERE id = ?';
      await pool.query(query, [photoPath, id]);
    } catch (error) {
      throw error;
    }
  }

  // Update password
  static async updatePassword(id, hashedPassword) {
    try {
      const query = 'UPDATE students SET password = ? WHERE id = ?';
      await pool.query(query, [hashedPassword, id]);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Student;
