const pool = require('../config/database');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Email transporter for invitations
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Get all departments
exports.getAllDepartments = async (req, res) => {
  try {
    const query = `
      SELECT d.*, 
             (SELECT COUNT(*) FROM tickets t WHERE t.category = d.name AND t.status IN ('open', 'in_progress')) as active_tickets_count
      FROM departments d
      ORDER BY d.name ASC
    `;
    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
};

// Create department
exports.createDepartment = async (req, res) => {
  try {
    const { name, description, head_name, head_email } = req.body;
    if (!name) return res.status(400).json({ error: 'Department name is required' });

    const query = 'INSERT INTO departments (name, description, head_name, head_email) VALUES (?, ?, ?, ?)';
    const [result] = await pool.query(query, [name, description, head_name, head_email]);

    res.json({ id: result.insertId, name, description, head_name, head_email, message: 'Department created successfully' });
  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({ error: 'Failed to create department' });
  }
};

// Update department
exports.updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, head_name, head_email } = req.body;

    // Check if department exists
    const [existing] = await pool.query('SELECT * FROM departments WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Department not found' });

    const oldEmail = existing[0].head_email;

    const query = 'UPDATE departments SET name = ?, description = ?, head_name = ?, head_email = ? WHERE id = ?';
    await pool.query(query, [name, description, head_name, head_email, id]);

    // If email changed and is not empty, send invitation
    if (head_email && head_email !== oldEmail) {
      // Re-use inviteHead logic
      req.body.email = head_email;
      req.body.departmentId = id;
      await exports.inviteHead(req, res);
      return; // inviteHead sends the response
    }

    res.json({ message: 'Department updated successfully' });
  } catch (error) {
    console.error('Update department error:', error);
    res.status(500).json({ error: 'Failed to update department' });
  }
};

// Delete department
exports.deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM departments WHERE id = ?', [id]);
    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    console.error('Delete department error:', error);
    res.status(500).json({ error: 'Failed to delete department' });
  }
};

// Ensure the department_invitations table exists
async function ensureInvitationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS department_invitations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      department_name VARCHAR(255) NOT NULL,
      token VARCHAR(255) NOT NULL UNIQUE,
      status ENUM('pending', 'accepted', 'expired') DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMP NOT NULL
    )
  `);
}

// Invite Department Head
exports.inviteHead = async (req, res) => {
  try {
    const { email, departmentId, password, head_name } = req.body;

    if (!email || !departmentId) {
      return res.status(400).json({ error: 'Email and departmentId are required' });
    }

    // Get department info
    const [depts] = await pool.query('SELECT name FROM departments WHERE id = ?', [departmentId]);
    if (depts.length === 0) return res.status(404).json({ error: 'Department not found' });

    const deptName = depts[0].name;
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours
    const normalizedEmail = email.toLowerCase().trim();
    const plainPassword = password && password.trim() ? password.trim() : crypto.randomBytes(6).toString('hex');
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Ensure the invitations table exists before inserting
    await ensureInvitationsTable();

    const [existingUsers] = await pool.query('SELECT id, role FROM students WHERE email = ?', [normalizedEmail]);
    if (existingUsers.length > 0 && existingUsers[0].role !== 'department_head') {
      return res.status(409).json({ error: 'This email is already used by another account' });
    }

    if (existingUsers.length === 0) {
      await pool.query(
        `INSERT INTO students (name, email, password, role, department, faculty, level, is_verified, is_active)
         VALUES (?, ?, ?, 'department_head', ?, 'BSc Hons Computer Science', 'Level 4', true, true)`,
        [head_name || deptName, normalizedEmail, hashedPassword, deptName]
      );
    } else {
      await pool.query(
        `UPDATE students
         SET name = ?, password = ?, department = ?, is_verified = true, is_active = true
         WHERE email = ?`,
        [head_name || deptName, hashedPassword, deptName, normalizedEmail]
      );
    }

    // Store invitation
    await pool.query(
      'INSERT INTO department_invitations (email, department_name, token, expires_at) VALUES (?, ?, ?, ?)',
      [normalizedEmail, deptName, token, expiresAt]
    );

    // Update the department's head_email
    await pool.query('UPDATE departments SET head_email = ?, head_name = ? WHERE id = ?', [normalizedEmail, head_name || deptName, departmentId]);

    // Send email
    const loginLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dept/login`;


    const mailOptions = {
      from: `"Setu Administration" <${process.env.EMAIL_USER}>`,
      to: normalizedEmail,
      subject: `Department access for ${deptName} - Setu Help Desk`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
          <h2 style="color: #0f172a;">Institutional Appointment</h2>
          <p>You have been appointed as the <strong>Head of ${deptName}</strong> in the Setu Help Desk system.</p>
          <p>You can sign in immediately with the credentials below.</p>
          <div style="background: #f8fafc; padding: 16px; border-radius: 12px; margin: 18px 0;">
            <p style="margin: 0 0 8px 0;"><strong>Email:</strong> ${normalizedEmail}</p>
            <p style="margin: 0;"><strong>Password:</strong> ${plainPassword}</p>
          </div>
          <div style="margin: 30px 0;">
            <a href="${loginLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Go to Department Login</a>
          </div>
          <p style="color: #64748b; font-size: 12px;">If you did not expect this invitation, please ignore this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Invitation sent successfully' });
  } catch (error) {
    console.error('Invite head error:', error);
    res.status(500).json({ error: `Failed to send invitation: ${error.message}` });
  }
};
