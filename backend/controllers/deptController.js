const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');
require('dotenv').config();

/* ─────────────────────────────────────────────────────────────
   ACCEPT INVITATION — POST /api/dept/accept-invitation
   Body: { token, name, password }
───────────────────────────────────────────────────────────── */
exports.acceptInvitation = async (req, res) => {
  try {
    const { token, name, password } = req.body;

    if (!token || !name || !password) {
      return res.status(400).json({ error: 'Token, name, and password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Validate token
    const [invitations] = await pool.query(
      `SELECT * FROM department_invitations 
       WHERE token = ? AND status = 'pending' AND expires_at > NOW()`,
      [token]
    );

    if (invitations.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired invitation token' });
    }

    const invitation = invitations[0];
    const { email, department_name } = invitation;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if email already registered
    const [existing] = await pool.query('SELECT id, role FROM students WHERE email = ?', [email]);
    let studentId;

    if (existing.length > 0) {
      if (existing[0].role !== 'department_head') {
        return res.status(409).json({ error: 'An account with this email already exists. Please login instead.' });
      }

      await pool.query(
        `UPDATE students SET name = ?, password = ?, department = ?, is_verified = true, is_active = true WHERE email = ?`,
        [name, hashedPassword, department_name, email]
      );
      studentId = existing[0].id;
    } else {
      // Create dept head account in students table
      const [result] = await pool.query(
        `INSERT INTO students (name, email, password, role, department, is_verified, is_active) 
         VALUES (?, ?, ?, 'department_head', ?, true, true)`,
        [name, email, hashedPassword, department_name]
      );
      studentId = result.insertId;
    }

    // Link dept head to department
    await pool.query(
      `UPDATE departments SET head_id = ?, head_name = ?, head_email = ? WHERE name = ?`,
      [studentId, name, email, department_name]
    );

    // Mark invitation as accepted
    await pool.query(
      `UPDATE department_invitations SET status = 'accepted' WHERE token = ?`,
      [token]
    );

    res.status(201).json({
      message: 'Account created successfully. You can now login.',
      department: department_name
    });
  } catch (error) {
    console.error('Accept invitation error:', error);
    res.status(500).json({ error: 'Failed to set up account. Please try again.' });
  }
};

/* ─────────────────────────────────────────────────────────────
   VALIDATE TOKEN (GET) — GET /api/dept/validate-invite?token=
   Used by SetupAccount page to pre-fill department name
───────────────────────────────────────────────────────────── */
exports.validateInviteToken = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: 'Token is required' });

    const [rows] = await pool.query(
      `SELECT department_name, email FROM department_invitations 
       WHERE token = ? AND status = 'pending' AND expires_at > NOW()`,
      [token]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired invitation token' });
    }

    res.json({ department: rows[0].department_name, email: rows[0].email, valid: true });
  } catch (error) {
    console.error('Validate invite error:', error);
    res.status(500).json({ error: 'Failed to validate token' });
  }
};

/* ─────────────────────────────────────────────────────────────
   DEPARTMENT HEAD LOGIN — POST /api/dept/login
   Body: { email, password }
───────────────────────────────────────────────────────────── */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find dept head
    const [rows] = await pool.query(
      `SELECT * FROM students WHERE email = ? AND role = 'department_head' AND is_active = true`,
      [email.toLowerCase().trim()]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials or account not found. Department login is by invitation only.' });
    }

    const head = rows[0];

    const isValid = await bcrypt.compare(password, head.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await pool.query('UPDATE students SET last_login = NOW() WHERE id = ?', [head.id]);

    const token = jwt.sign(
      {
        id: head.id,
        email: head.email,
        role: 'department_head',
        department: head.department
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      message: 'Login successful',
      token,
      deptHead: {
        id: head.id,
        name: head.name,
        email: head.email,
        department: head.department,
        role: 'department_head'
      }
    });
  } catch (error) {
    console.error('Dept login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/* ─────────────────────────────────────────────────────────────
   GET DEPT TICKETS — GET /api/dept/tickets
   Returns tickets where category = req.deptName
───────────────────────────────────────────────────────────── */
exports.getDeptTickets = async (req, res) => {
  try {
    const { status, priority } = req.query;
    const deptName = req.deptName;

    let query = `
      SELECT t.*, 
             s.name as student_name,
             s.email as student_email,
             s.faculty as student_faculty,
             s.level as student_level,
             COUNT(ta.id) as attachment_count
      FROM tickets t
      LEFT JOIN students s ON t.student_id = s.id
      LEFT JOIN ticket_attachments ta ON t.id = ta.ticket_id
      WHERE t.category = ?
    `;
    const params = [deptName];

    if (status) { query += ' AND t.status = ?'; params.push(status); }
    if (priority) { query += ' AND t.priority = ?'; params.push(priority); }

    query += ' GROUP BY t.id ORDER BY t.created_at DESC';

    const [rows] = await pool.query(query, params);

    res.json({ tickets: rows, count: rows.length });
  } catch (error) {
    console.error('Get dept tickets error:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
};

/* ─────────────────────────────────────────────────────────────
   GET TICKET DETAIL — GET /api/dept/tickets/:id
───────────────────────────────────────────────────────────── */
exports.getDeptTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    const deptName = req.deptName;

    const [rows] = await pool.query(
      `SELECT t.*, s.name as student_name, s.email as student_email, 
              s.faculty as student_faculty, s.level as student_level,
              s.profile_photo as student_photo
       FROM tickets t
       LEFT JOIN students s ON t.student_id = s.id
       WHERE t.id = ? AND t.category = ?`,
      [id, deptName]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found or not in your department' });
    }

    const ticket = rows[0];

    // Get attachments
    const [attachments] = await pool.query(
      'SELECT * FROM ticket_attachments WHERE ticket_id = ? ORDER BY created_at',
      [id]
    );
    ticket.attachments = attachments;

    // Get comments / activity stream
    const [comments] = await pool.query(
      'SELECT * FROM ticket_comments WHERE ticket_id = ? ORDER BY created_at ASC',
      [id]
    );
    ticket.comments = comments;

    res.json({ ticket });
  } catch (error) {
    console.error('Get dept ticket error:', error);
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
};

/* ─────────────────────────────────────────────────────────────
   GET DEPT STATS — GET /api/dept/stats
───────────────────────────────────────────────────────────── */
exports.getDeptStats = async (req, res) => {
  try {
    const deptName = req.deptName;

    const [rows] = await pool.query(
      `SELECT 
         COUNT(*) as total,
         SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open_count,
         SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as inprogress_count,
         SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_count,
         SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed_count,
         SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as high_priority_count,
         SUM(CASE WHEN DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND status = 'resolved' THEN 1 ELSE 0 END) as resolved_this_week
       FROM tickets
       WHERE category = ?`,
      [deptName]
    );

    // Weekly data for chart (last 7 days)
    const [weekly] = await pool.query(
      `SELECT DATE(created_at) as date, COUNT(*) as count
       FROM tickets
       WHERE category = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       GROUP BY DATE(created_at)
       ORDER BY date ASC`,
      [deptName]
    );

    res.json({ stats: rows[0], weekly });
  } catch (error) {
    console.error('Get dept stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

/* ─────────────────────────────────────────────────────────────
   UPDATE TICKET STATUS — PATCH /api/dept/tickets/:id/status
───────────────────────────────────────────────────────────── */
exports.updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const deptName = req.deptName;

    if (!['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Verify ticket belongs to this dept
    const [rows] = await pool.query(
      'SELECT id FROM tickets WHERE id = ? AND category = ?',
      [id, deptName]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found in your department' });
    }

    await pool.query(
      'UPDATE tickets SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );

    res.json({ message: 'Status updated successfully' });
  } catch (error) {
    console.error('Update ticket status error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
};

/* ─────────────────────────────────────────────────────────────
   ADD COMMENT — POST /api/dept/tickets/:id/comments
───────────────────────────────────────────────────────────── */
exports.addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const deptName = req.deptName;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Verify ticket belongs to dept
    const [rows] = await pool.query(
      'SELECT id FROM tickets WHERE id = ? AND category = ?',
      [id, deptName]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found in your department' });
    }

    // Get dept head name
    const [headRows] = await pool.query('SELECT name FROM students WHERE id = ?', [req.deptHeadId]);
    const authorName = headRows[0]?.name || 'Staff';

    const [result] = await pool.query(
      `INSERT INTO ticket_comments (ticket_id, author_id, author_name, author_role, message)
       VALUES (?, ?, ?, 'department_head', ?)`,
      [id, req.deptHeadId, authorName, message.trim()]
    );

    const [newComment] = await pool.query('SELECT * FROM ticket_comments WHERE id = ?', [result.insertId]);

    res.status(201).json({ message: 'Comment added', comment: newComment[0] });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

/* ─────────────────────────────────────────────────────────────
   GET DEPT PROFILE — GET /api/dept/profile
───────────────────────────────────────────────────────────── */
exports.getProfile = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, department, role, created_at, last_login FROM students WHERE id = ?',
      [req.deptHeadId]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Profile not found' });
    res.json(rows[0]);
  } catch (error) {
    console.error('Get dept profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};
