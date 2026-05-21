const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Middleware: Verify Admin JWT Token
 * 
 * Checks for a valid JWT in the Authorization header,
 * ensures the token contains role: 'admin', and attaches
 * adminId to the request object.
 */
const verifyAdminToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header is required' });
    }

    // Expect format: "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ error: 'Invalid authorization format. Use: Bearer <token>' });
    }

    const token = parts[1];

    if (!token || token === 'null' || token === 'undefined') {
      return res.status(401).json({ error: 'No valid token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ensure the token belongs to an admin
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }

    req.adminId = decoded.id;
    req.adminEmail = decoded.email;
    req.adminRole = decoded.role;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Admin session has expired. Please login again.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid admin token' });
    }
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

/**
 * Middleware: Require Admin Role
 * 
 * Use AFTER verifyAdminToken. This is a secondary guard
 * that can be chained for extra protection on sensitive routes.
 */
const requireAdmin = (req, res, next) => {
  if (req.adminRole !== 'admin') {
    return res.status(403).json({ error: 'Forbidden. Admin role required.' });
  }
  next();
};

module.exports = { verifyAdminToken, requireAdmin };
