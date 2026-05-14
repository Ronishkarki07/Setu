const express = require('express');
const router = express.Router();
const deptController = require('../controllers/deptController');
const { verifyDeptToken } = require('../middleware/deptAuth');

// ── PUBLIC (no auth) ──────────────────────────────────────────
// Validate invitation token (used by SetupAccount page to preview dept name)
router.get('/validate-invite', deptController.validateInviteToken);

// Accept invitation & create account
router.post('/accept-invitation', deptController.acceptInvitation);

// Department head login
router.post('/login', deptController.login);

// ── PROTECTED (dept head token required) ─────────────────────
// Profile
router.get('/profile', verifyDeptToken, deptController.getProfile);

// Ticket stats (must come before /:id route)
router.get('/stats', verifyDeptToken, deptController.getDeptStats);

// All tickets for this department
router.get('/tickets', verifyDeptToken, deptController.getDeptTickets);

// Single ticket detail
router.get('/tickets/:id', verifyDeptToken, deptController.getDeptTicketById);

// Update ticket status
router.patch('/tickets/:id/status', verifyDeptToken, deptController.updateTicketStatus);

// Add comment to ticket
router.post('/tickets/:id/comments', verifyDeptToken, deptController.addComment);

module.exports = router;
