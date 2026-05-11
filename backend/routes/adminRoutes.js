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

// --- User Registry ---
router.get('/users', verifyAdminToken, adminController.getAllUsers);
router.patch('/users/:id/status', verifyAdminToken, adminController.updateUserStatus);
router.get('/metadata', verifyAdminToken, adminController.getInstitutionalMetadata);

// --- Departments ---
const departmentController = require('../controllers/departmentController');
router.get('/departments', verifyAdminToken, departmentController.getAllDepartments);
router.post('/departments', verifyAdminToken, departmentController.createDepartment);
router.put('/departments/:id', verifyAdminToken, departmentController.updateDepartment);
router.delete('/departments/:id', verifyAdminToken, departmentController.deleteDepartment);
router.post('/departments/invite', verifyAdminToken, departmentController.inviteHead);

module.exports = router;
