const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// User: get their messages
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [msgs] = await db.query(
      'SELECT * FROM messages WHERE user_id = ? ORDER BY created_at ASC',
      [req.user.id]
    );
    res.json(msgs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// User: send message
router.post('/', authMiddleware, async (req, res) => {
  const { message } = req.body;
  try {
    await db.query(
      'INSERT INTO messages (user_id, sender, message) VALUES (?,?,?)',
      [req.user.id, 'user', message]
    );
    res.status(201).json({ message: 'Sent' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Admin: get all conversations
router.get('/admin/all', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [convos] = await db.query(
      `SELECT m.*, u.name as user_name, u.email as user_email
       FROM messages m JOIN users u ON u.id = m.user_id
       ORDER BY m.created_at DESC`
    );
    res.json(convos);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Admin: reply to user
router.post('/admin/reply', authMiddleware, adminMiddleware, async (req, res) => {
  const { user_id, message } = req.body;
  try {
    await db.query(
      'INSERT INTO messages (user_id, sender, message) VALUES (?,?,?)',
      [user_id, 'admin', message]
    );
    res.status(201).json({ message: 'Reply sent' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
