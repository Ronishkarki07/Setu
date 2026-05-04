const express = require('express');
const adminController = require('../controllers/adminController');
const { verifyAdminToken } = require('../middleware/adminAuth');

const router = express.Router();

// ========================================
//  PUBLIC ROUTES (no auth required)
// ========================================

// Admin login — the ONLY public admin endpoint
// No signup/register route exists by design
router.post('/login', adminController.login);

// ========================================
//  PROTECTED ROUTES (admin token required)
// ========================================

// Verify current admin session is still valid
router.get('/verify', verifyAdminToken, adminController.verifySession);

// Get admin profile
router.get('/profile', verifyAdminToken, adminController.getProfile);

module.exports = router;
