const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

// Get cart
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [items] = await db.query(
      `SELECT c.id, c.quantity, d.id as dish_id, d.name, d.price, d.image_url, d.category
       FROM cart c JOIN dishes d ON d.id = c.dish_id
       WHERE c.user_id = ?`,
      [req.user.id]
    );
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Add to cart
router.post('/', authMiddleware, async (req, res) => {
  const { dish_id, quantity = 1 } = req.body;
  try {
    await db.query(
      'INSERT INTO cart (user_id, dish_id, quantity) VALUES (?,?,?) ON DUPLICATE KEY UPDATE quantity = quantity + ?',
      [req.user.id, dish_id, quantity, quantity]
    );
    res.json({ message: 'Added to cart' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update quantity
router.put('/:id', authMiddleware, async (req, res) => {
  const { quantity } = req.body;
  try {
    if (quantity <= 0) {
      await db.query('DELETE FROM cart WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    } else {
      await db.query('UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?', [quantity, req.params.id, req.user.id]);
    }
    res.json({ message: 'Cart updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Remove from cart
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await db.query('DELETE FROM cart WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Removed from cart' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
