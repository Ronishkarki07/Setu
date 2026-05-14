const pool = require('../config/database');
const crypto = require('crypto');
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
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Department name is required' });

    const query = 'INSERT INTO departments (name, description) VALUES (?, ?)';
    const [result] = await pool.query(query, [name, description]);
    
    res.json({ id: result.insertId, name, description, message: 'Department created successfully' });
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

// Invite Department Head
exports.inviteHead = async (req, res) => {
  try {
    const { email, departmentId } = req.body;
    
    // Get department info
    const [depts] = await pool.query('SELECT name FROM departments WHERE id = ?', [departmentId]);
    if (depts.length === 0) return res.status(404).json({ error: 'Department not found' });
    
    const deptName = depts[0].name;
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

    // Store invitation
    await pool.query(
      'INSERT INTO department_invitations (email, department_name, token, expires_at) VALUES (?, ?, ?, ?)',
      [email, deptName, token, expiresAt]
    );

    // Send email
    const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/setup-head?token=${token}`;
    
    const mailOptions = {
      from: `"Setu Administration" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Invitation: Head of ${deptName} - Setu Help Desk`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
          <h2 style="color: #0f172a;">Institutional Appointment</h2>
          <p>You have been invited to serve as the <strong>Head of ${deptName}</strong> in the Setu Help Desk system.</p>
          <p>This role allows you to manage departmental staff, oversee service unit performance, and resolve escalated academic issues.</p>
          <div style="margin: 30px 0;">
            <a href="${inviteLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Accept Appointment & Setup Account</a>
          </div>
          <p style="color: #64748b; font-size: 12px;">This invitation expires in 48 hours. If you did not expect this invitation, please ignore this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Invitation sent successfully' });
  } catch (error) {
    console.error('Invite head error:', error);
    res.status(500).json({ error: 'Failed to send invitation' });
  }
};
