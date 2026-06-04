const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Admin: Inventory - dishes with order frequency
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [inventory] = await db.query(
      `SELECT 
        d.id, d.name, d.category, d.price, d.is_available,
        COALESCE(SUM(oi.quantity), 0) as total_ordered,
        COALESCE(COUNT(DISTINCT oi.order_id), 0) as order_count,
        COALESCE(SUM(oi.quantity * oi.unit_price), 0) as total_revenue
       FROM dishes d
       LEFT JOIN order_items oi ON oi.dish_id = d.id
       GROUP BY d.id
       ORDER BY total_ordered DESC`
    );
    res.json(inventory);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Admin: Toggle dish availability
router.put('/:id/toggle', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await db.query('UPDATE dishes SET is_available = NOT is_available WHERE id = ?', [req.params.id]);
    res.json({ message: 'Availability toggled' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
