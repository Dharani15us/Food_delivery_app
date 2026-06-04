const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Get all dishes (with optional search) - public route
router.get('/', async (req, res) => {
  const { search, category } = req.query;
  let query = 'SELECT * FROM dishes WHERE is_available = TRUE';
  const params = [];

  if (search) {
    query += ' AND (name LIKE ? OR description LIKE ? OR category LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }

  try {
    const [dishes] = await db.query(query, params);
    res.json(dishes);
  } catch (err) {
    console.error('Dishes fetch error:', err.message);
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

// Admin: Add dish
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  const { name, description, price, category, image_url } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO dishes (name, description, price, category, image_url) VALUES (?,?,?,?,?)',
      [name, description, price, category, image_url]
    );
    res.status(201).json({ id: result.insertId, name, description, price, category, image_url });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Admin: Update dish
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { name, description, price, category, image_url, is_available } = req.body;
  try {
    await db.query(
      'UPDATE dishes SET name=?, description=?, price=?, category=?, image_url=?, is_available=? WHERE id=?',
      [name, description, price, category, image_url, is_available, req.params.id]
    );
    res.json({ message: 'Dish updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Admin: Delete dish
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await db.query('DELETE FROM dishes WHERE id = ?', [req.params.id]);
    res.json({ message: 'Dish deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
