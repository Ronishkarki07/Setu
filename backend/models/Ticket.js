const pool = require('../config/database');

class Ticket {
  // Create a new ticket
  static async create({ studentId, title, description, category, priority, attachments }) {
    try {
      const ticketNumber = 'TKT-' + Date.now();
      
      const query = `
        INSERT INTO tickets (ticket_number, student_id, title, description, category, priority)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      const [result] = await pool.query(query, [
        ticketNumber,
        studentId,
        title,
        description,
        category,
        priority || 'medium'
      ]);
      
      const ticketId = result.insertId;
      
      // Store attachments if any
      if (attachments && attachments.length > 0) {
        await this.addAttachments(ticketId, attachments);
      }
      
      return {
        id: ticketId,
        ticketNumber,
        studentId,
        title,
        description,
        category,
        priority: priority || 'medium',
        status: 'open'
      };
    } catch (error) {
      throw error;
    }
  }

  // Get all tickets for a student
  static async getByStudentId(studentId) {
    try {
      const query = `
        SELECT t.*, 
               GROUP_CONCAT(ta.attachment_path) as attachments,
               s.name as student_name,
               s.email as student_email
        FROM tickets t
        LEFT JOIN ticket_attachments ta ON t.id = ta.ticket_id
        LEFT JOIN students s ON t.student_id = s.id
        WHERE t.student_id = ?
        GROUP BY t.id
        ORDER BY t.created_at DESC
      `;
      const [rows] = await pool.query(query, [studentId]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get ticket by ID
  static async getById(id) {
    try {
      const query = `
        SELECT t.*, 
               s.name as student_name,
               s.email as student_email
        FROM tickets t
        LEFT JOIN students s ON t.student_id = s.id
        WHERE t.id = ?
      `;
      const [rows] = await pool.query(query, [id]);
      
      if (rows.length === 0) {
        return null;
      }
      
      const ticket = rows[0];
      
      // Get attachments
      const attachmentQuery = `
        SELECT id, attachment_path, original_filename, created_at
        FROM ticket_attachments
        WHERE ticket_id = ?
        ORDER BY created_at DESC
      `;
      const [attachments] = await pool.query(attachmentQuery, [id]);
      ticket.attachments = attachments;
      
      return ticket;
    } catch (error) {
      throw error;
    }
  }

  // Get all tickets (for admin)
  static async getAll(filters = {}) {
    try {
      let query = `
        SELECT t.*, 
               s.name as student_name,
               s.email as student_email,
               COUNT(ta.id) as attachment_count
        FROM tickets t
        LEFT JOIN students s ON t.student_id = s.id
        LEFT JOIN ticket_attachments ta ON t.id = ta.ticket_id
        WHERE 1=1
      `;
      
      const params = [];
      
      if (filters.status) {
        query += ' AND t.status = ?';
        params.push(filters.status);
      }
      
      if (filters.priority) {
        query += ' AND t.priority = ?';
        params.push(filters.priority);
      }
      
      if (filters.category) {
        query += ' AND t.category = ?';
        params.push(filters.category);
      }
      
      query += ' GROUP BY t.id ORDER BY t.created_at DESC';
      
      const [rows] = await pool.query(query, params);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Update ticket status
  static async updateStatus(id, status) {
    try {
      const query = `
        UPDATE tickets 
        SET status = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      const [result] = await pool.query(query, [status, id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Update ticket
  static async update(id, { title, description, category, priority }) {
    try {
      const query = `
        UPDATE tickets 
        SET title = ?, 
            description = ?, 
            category = ?, 
            priority = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      const [result] = await pool.query(query, [title, description, category, priority, id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Add attachments to ticket
  static async addAttachments(ticketId, attachments) {
    try {
      for (let attachment of attachments) {
        const query = `
          INSERT INTO ticket_attachments (ticket_id, attachment_path, original_filename)
          VALUES (?, ?, ?)
        `;
        await pool.query(query, [ticketId, attachment.path, attachment.filename]);
      }
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Get attachment
  static async getAttachment(attachmentId) {
    try {
      const query = `
        SELECT * FROM ticket_attachments WHERE id = ?
      `;
      const [rows] = await pool.query(query, [attachmentId]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Delete attachment
  static async deleteAttachment(attachmentId) {
    try {
      const query = `
        DELETE FROM ticket_attachments WHERE id = ?
      `;
      const [result] = await pool.query(query, [attachmentId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Delete ticket
  static async delete(id) {
    try {
      const query = `
        DELETE FROM tickets WHERE id = ?
      `;
      const [result] = await pool.query(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Get ticket statistics
  static async getStatistics(studentId = null) {
    try {
      let query = `
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open_count,
          SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as inprogress_count,
          SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_count,
          SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed_count
        FROM tickets
      `;
      
      if (studentId) {
        query += ` WHERE student_id = ?`;
        const [rows] = await pool.query(query, [studentId]);
        return rows[0];
      }
      
      const [rows] = await pool.query(query);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Ticket;
