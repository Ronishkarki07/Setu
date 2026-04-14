const express = require('express');
const multer = require('multer');
const path = require('path');
const ticketController = require('../controllers/ticketController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/tickets/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedMimes = [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
    'application/vnd.ms-excel' // xls
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, PNG, JPG, JPEG, and XLSX files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Routes

// Create ticket with attachments (protected)
router.post('/create', verifyToken, upload.array('attachments', 5), ticketController.createTicket);

// Get all tickets for logged-in student (protected)
router.get('/my-tickets', verifyToken, ticketController.getMyTickets);

// Get single ticket by ID (protected)
router.get('/:id', verifyToken, ticketController.getTicket);

// Update ticket (protected)
router.put('/:id', verifyToken, ticketController.updateTicket);

// Update ticket status (admin only)
router.patch('/:id/status', verifyToken, ticketController.updateTicketStatus);

// Add attachment to ticket (protected)
router.post('/:id/attachments', verifyToken, upload.single('attachment'), ticketController.addAttachment);

// Download attachment (protected)
router.get('/attachments/:attachmentId/download', verifyToken, ticketController.downloadAttachment);

// Delete attachment (protected)
router.delete('/attachments/:attachmentId', verifyToken, ticketController.deleteAttachment);

// Delete ticket (protected)
router.delete('/:id', verifyToken, ticketController.deleteTicket);

// Get ticket statistics (protected)
router.get('/stats/overview', verifyToken, ticketController.getTicketStatistics);

// Get all tickets (admin only)
router.get('/', verifyToken, ticketController.getAllTickets);

module.exports = router;
