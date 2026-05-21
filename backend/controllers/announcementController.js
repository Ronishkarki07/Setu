const pool = require('../config/database');

exports.createAnnouncement = async (req, res) => {
  try {
    const { title, audience, content, isEmergency } = req.body;
    const [result] = await pool.query(
      'INSERT INTO announcements (title, audience, content, is_emergency, created_by) VALUES (?, ?, ?, ?, ?)',
      [title, audience, content, isEmergency ? 1 : 0, 'Admin']
    );
    res.status(201).json({ message: 'Announcement published successfully', id: result.insertId });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ error: 'Failed to publish announcement' });
  }
};

exports.getAnnouncements = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM announcements ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
};

exports.deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM announcements WHERE id = ?', [id]);
    res.json({ message: 'Announcement deleted' });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({ error: 'Failed to delete announcement' });
  }
};
