const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const { verifyAdminToken } = require('../middleware/auth');

router.post('/', verifyAdminToken, announcementController.createAnnouncement);
router.get('/', announcementController.getAnnouncements);
router.delete('/:id', verifyAdminToken, announcementController.deleteAnnouncement);

module.exports = router;
