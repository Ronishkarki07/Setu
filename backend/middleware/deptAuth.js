const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Middleware: Verify Department Head JWT Token
 *
 * Checks for a valid JWT in the Authorization header,
 * ensures the token contains role: 'department_head',
 * and attaches deptHeadId + deptName to req.
 */
const verifyDeptToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header is required' });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ error: 'Invalid authorization format. Use: Bearer <token>' });
    }

    const token = parts[1];

    if (!token || token === 'null' || token === 'undefined') {
      return res.status(401).json({ error: 'No valid token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'department_head') {
      return res.status(403).json({ error: 'Access denied. Department head privileges required.' });
    }

    req.deptHeadId = decoded.id;
    req.deptName = decoded.department;
    req.deptHeadEmail = decoded.email;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session has expired. Please login again.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

module.exports = { verifyDeptToken };
