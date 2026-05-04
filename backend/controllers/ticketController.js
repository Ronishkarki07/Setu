const Ticket = require('../models/Ticket');
const fs = require('fs');
const path = require('path');

// Create a new ticket
exports.createTicket = async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;
    const studentId = req.studentId;

    // Validation
    if (!title || !description || !category) {
      return res.status(400).json({ error: 'Title, description, and category are required' });
    }

    if (!['low', 'medium', 'high'].includes(priority)) {
      return res.status(400).json({ error: 'Invalid priority level' });
    }

    // Prepare attachments
    const attachments = req.files ? req.files.map(file => ({
      path: file.path,
      filename: file.originalname
    })) : [];

    // Create ticket
    const ticket = await Ticket.create({
      studentId,
      title,
      description,
      category,
      priority,
      attachments
    });

    res.status(201).json({
      message: 'Ticket created successfully',
      ticket
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    
    // Clean up uploaded files if ticket creation fails
    if (req.files) {
      req.files.forEach(file => {
        try {
          fs.unlinkSync(file.path);
        } catch (err) {
          console.error('Failed to delete file:', err);
        }
      });
    }

    res.status(500).json({ error: 'Failed to create ticket' });
  }
};

// Get all tickets for the logged-in student
exports.getMyTickets = async (req, res) => {
  try {
    const studentId = req.studentId;
    const tickets = await Ticket.getByStudentId(studentId);

    res.json({
      message: 'Tickets retrieved successfully',
      tickets,
      count: tickets.length
    });
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ error: 'Failed to retrieve tickets' });
  }
};

// Get ticket by ID
exports.getTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.studentId;

    const ticket = await Ticket.getById(id);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Check if student owns this ticket
    if (ticket.student_id !== studentId) {
      return res.status(403).json({ error: 'You do not have permission to view this ticket' });
    }

    res.json({
      message: 'Ticket retrieved successfully',
      ticket
    });
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({ error: 'Failed to retrieve ticket' });
  }
};

// Get all tickets (admin only)
exports.getAllTickets = async (req, res) => {
  try {
    const { status, priority, category } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (category) filters.category = category;

    const tickets = await Ticket.getAll(filters);

    res.json({
      message: 'All tickets retrieved successfully',
      tickets,
      count: tickets.length
    });
  } catch (error) {
    console.error('Get all tickets error:', error);
    res.status(500).json({ error: 'Failed to retrieve tickets' });
  }
};

// Update ticket
exports.updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, priority } = req.body;
    const studentId = req.studentId;

    const ticket = await Ticket.getById(id);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Check ownership
    if (ticket.student_id !== studentId) {
      return res.status(403).json({ error: 'You do not have permission to update this ticket' });
    }

    const updated = await Ticket.update(id, {
      title: title || ticket.title,
      description: description || ticket.description,
      category: category || ticket.category,
      priority: priority || ticket.priority
    });

    if (!updated) {
      return res.status(500).json({ error: 'Failed to update ticket' });
    }

    const updatedTicket = await Ticket.getById(id);

    res.json({
      message: 'Ticket updated successfully',
      ticket: updatedTicket
    });
  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({ error: 'Failed to update ticket' });
  }
};

// Update ticket status (admin only)
exports.updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const ticket = await Ticket.getById(id);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const updated = await Ticket.updateStatus(id, status);

    if (!updated) {
      return res.status(500).json({ error: 'Failed to update ticket status' });
    }

    const updatedTicket = await Ticket.getById(id);

    res.json({
      message: 'Ticket status updated successfully',
      ticket: updatedTicket
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Failed to update ticket status' });
  }
};

// Add attachment to ticket
exports.addAttachment = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.studentId;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const ticket = await Ticket.getById(id);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Check ownership
    if (ticket.student_id !== studentId) {
      return res.status(403).json({ error: 'You do not have permission to update this ticket' });
    }

    const attachments = [{
      path: req.file.path,
      filename: req.file.originalname
    }];

    await Ticket.addAttachments(id, attachments);

    const updatedTicket = await Ticket.getById(id);

    res.json({
      message: 'Attachment added successfully',
      attachment: {
        filename: req.file.originalname,
        path: req.file.path
      },
      ticket: updatedTicket
    });
  } catch (error) {
    console.error('Add attachment error:', error);

    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error('Failed to delete file:', err);
      }
    }

    res.status(500).json({ error: 'Failed to add attachment' });
  }
};

// Download attachment
exports.downloadAttachment = async (req, res) => {
  try {
    const { attachmentId } = req.params;

    const attachment = await Ticket.getAttachment(attachmentId);

    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    const filePath = path.join(__dirname, '..', attachment.attachment_path);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.download(filePath, attachment.original_filename);
  } catch (error) {
    console.error('Download attachment error:', error);
    res.status(500).json({ error: 'Failed to download attachment' });
  }
};

// Delete attachment
exports.deleteAttachment = async (req, res) => {
  try {
    const { attachmentId } = req.params;
    const studentId = req.studentId;

    const attachment = await Ticket.getAttachment(attachmentId);

    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    // Check if student owns the ticket
    const ticket = await Ticket.getById(attachment.ticket_id);
    if (ticket.student_id !== studentId) {
      return res.status(403).json({ error: 'You do not have permission to delete this attachment' });
    }

    // Delete file from filesystem
    const filePath = path.join(__dirname, '..', attachment.attachment_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    await Ticket.deleteAttachment(attachmentId);

    res.json({
      message: 'Attachment deleted successfully'
    });
  } catch (error) {
    console.error('Delete attachment error:', error);
    res.status(500).json({ error: 'Failed to delete attachment' });
  }
};

// Delete ticket
exports.deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.studentId;

    const ticket = await Ticket.getById(id);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Check ownership
    if (ticket.student_id !== studentId) {
      return res.status(403).json({ error: 'You do not have permission to delete this ticket' });
    }

    // Delete attachments from filesystem
    if (ticket.attachments && ticket.attachments.length > 0) {
      ticket.attachments.forEach(attachment => {
        const filePath = path.join(__dirname, '..', attachment.attachment_path);
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch (err) {
            console.error('Failed to delete file:', err);
          }
        }
      });
    }

    // Delete from database
    await Ticket.delete(id);

    res.json({
      message: 'Ticket deleted successfully'
    });
  } catch (error) {
    console.error('Delete ticket error:', error);
    res.status(500).json({ error: 'Failed to delete ticket' });
  }
};

// Get ticket statistics
exports.getTicketStatistics = async (req, res) => {
  try {
    const studentId = req.studentId;
    const stats = await Ticket.getStatistics(studentId);

    res.json({
      message: 'Ticket statistics retrieved successfully',
      statistics: stats
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({ error: 'Failed to retrieve statistics' });
  }
};
