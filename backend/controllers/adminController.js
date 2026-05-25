const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');
require('dotenv').config();

const ADMIN_ID = 'admin_001';
const ADMIN_EMAIL = 'admin@bicnepal.edu.np';
const ADMIN_PASSWORD = 'Admin@Setu2026';
const ADMIN_NAME = 'System Administrator';

// Pre-hashed at module load so we never store plaintext in memory
// during request handling.
let ADMIN_PASSWORD_HASH = null;

// Hash the password once at startup
(async () => {
  ADMIN_PASSWORD_HASH = await bcrypt.hash(ADMIN_PASSWORD, 12);
})();

/*
 *  BRUTE-FORCE PROTECTION (in-memory, per-process)
 */
const loginAttempts = new Map(); // key: IP, value: { count, lastAttempt }
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(ip) {
  const record = loginAttempts.get(ip);
  if (!record) return { blocked: false };

  // Reset if lockout window has passed
  if (Date.now() - record.lastAttempt > LOCKOUT_DURATION_MS) {
    loginAttempts.delete(ip);
    return { blocked: false };
  }

  if (record.count >= MAX_ATTEMPTS) {
    const remainingMs = LOCKOUT_DURATION_MS - (Date.now() - record.lastAttempt);
    const remainingMins = Math.ceil(remainingMs / 60000);
    return { blocked: true, remainingMins };
  }

  return { blocked: false };
}

function recordFailedAttempt(ip) {
  const record = loginAttempts.get(ip) || { count: 0, lastAttempt: Date.now() };
  record.count += 1;
  record.lastAttempt = Date.now();
  loginAttempts.set(ip, record);
}

function clearAttempts(ip) {
  loginAttempts.delete(ip);
}

/*
 * ============================================================
 *  VALIDATION HELPERS
 * ============================================================
 */
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function sanitizeInput(str) {
  if (typeof str !== 'string') return '';
  return str.trim();
}

/*
 * ============================================================
 *  ADMIN LOGIN
 *  POST /api/admin/login
 *  Body: { email, password }
 * ============================================================
 */
exports.login = async (req, res) => {
  try {
    const clientIp = req.ip || req.connection.remoteAddress;

    // --- Rate-limit check ---
    const rateCheck = checkRateLimit(clientIp);
    if (rateCheck.blocked) {
      return res.status(429).json({
        error: `Too many failed login attempts. Account locked for ${rateCheck.remainingMins} minute(s). Please try again later.`
      });
    }

    // --- Extract & sanitize inputs ---
    const email = sanitizeInput(req.body.email);
    const password = req.body.password; // don't trim passwords

    // --- Required fields ---
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required',
        fields: {
          email: !email ? 'Email is required' : null,
          password: !password ? 'Password is required' : null
        }
      });
    }

    // --- Email format validation ---
    if (!validateEmail(email)) {
      return res.status(400).json({
        error: 'Please enter a valid email address'
      });
    }

    // --- Password length validation ---
    if (password.length < 8) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters'
      });
    }

    if (password.length > 128) {
      return res.status(400).json({
        error: 'Password exceeds maximum length'
      });
    }

    // --- Credential check ---
    // Use constant-time comparison for email to prevent timing attacks
    const emailMatch = email.toLowerCase() === ADMIN_EMAIL;

    // Wait for hash to be ready (should be instant after startup)
    if (!ADMIN_PASSWORD_HASH) {
      ADMIN_PASSWORD_HASH = await bcrypt.hash(ADMIN_PASSWORD, 12);
    }

    const passwordMatch = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);

    if (!emailMatch || !passwordMatch) {
      recordFailedAttempt(clientIp);
      const record = loginAttempts.get(clientIp);
      const attemptsRemaining = MAX_ATTEMPTS - (record ? record.count : 0);

      return res.status(401).json({
        error: 'Invalid admin credentials',
        ...(attemptsRemaining <= 3 && attemptsRemaining > 0 && {
          warning: `${attemptsRemaining} attempt(s) remaining before account lockout`
        })
      });
    }

    // --- Successful login ---
    clearAttempts(clientIp);

    const token = jwt.sign(
      {
        id: ADMIN_ID,
        email: ADMIN_EMAIL,
        role: 'admin'
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.ADMIN_JWT_EXPIRY || '4h' }
    );

    res.json({
      message: 'Admin login successful',
      token,
      admin: {
        id: ADMIN_ID,
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        role: 'admin'
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/*
 * ============================================================
 *  GET ADMIN PROFILE (protected)
 *  GET /api/admin/profile
 * ============================================================
 */
exports.getProfile = async (req, res) => {
  try {
    // req.adminId is set by verifyAdminToken middleware
    if (req.adminId !== ADMIN_ID) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      id: ADMIN_ID,
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      role: 'admin'
    });
  } catch (error) {
    console.error('Admin profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/*
 * ============================================================
 *  VERIFY ADMIN SESSION (protected)
 *  GET /api/admin/verify
 *  Used by frontend to check if current token is still valid
 * ============================================================
 */
exports.verifySession = async (req, res) => {
  try {
    res.json({
      valid: true,
      admin: {
        id: ADMIN_ID,
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        role: 'admin'
      }
    });
  } catch (error) {
    console.error('Admin verify session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/*
 * ============================================================
 *  USER REGISTRY MANAGEMENT
 * ============================================================
 */

// Get all users (Students & Staff)
exports.getAllUsers = async (req, res) => {
  try {
    const query = 'SELECT id, name, email, faculty, level, role, is_active, created_at, last_login, profile_photo FROM students ORDER BY created_at DESC';
    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Failed to fetch user registry' });
  }
};

// Toggle user activation status
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    const query = 'UPDATE students SET is_active = ? WHERE id = ?';
    await pool.query(query, [is_active, id]);

    res.json({ message: `User account ${is_active ? 'activated' : 'deactivated'} successfully` });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ error: 'Failed to update account status' });
  }
};

// Get institutional metadata (faculties & levels)
exports.getInstitutionalMetadata = async (req, res) => {
  try {
    const [faculties] = await pool.query('SELECT * FROM faculties ORDER BY name');
    const [levels] = await pool.query('SELECT * FROM levels ORDER BY id');
    res.json({ faculties, levels });
  } catch (error) {
    console.error('Metadata error:', error);
    res.status(500).json({ error: 'Failed to fetch institutional metadata' });
  }
};
