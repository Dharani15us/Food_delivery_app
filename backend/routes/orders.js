const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Place order
router.post('/', authMiddleware, async (req, res) => {
  const { items, delivery_address, payment_mode } = req.body;
  if (!items || items.length === 0) return res.status(400).json({ message: 'No items in order' });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const [orderResult] = await conn.query(
      'INSERT INTO orders (user_id, total_amount, delivery_address, payment_mode) VALUES (?,?,?,?)',
      [req.user.id, total.toFixed(2), delivery_address, payment_mode || 'cash']
    );
    const orderId = orderResult.insertId;

    for (const item of items) {
      await conn.query(
        'INSERT INTO order_items (order_id, dish_id, quantity, unit_price) VALUES (?,?,?,?)',
        [orderId, item.dish_id, item.quantity, item.price]
      );
    }

    // Clear cart
    await conn.query('DELETE FROM cart WHERE user_id = ?', [req.user.id]);

    await conn.commit();
    res.status(201).json({ order_id: orderId, total, message: 'Order placed successfully' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    conn.release();
  }
});

// Get user's own orders
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT o.*, 
        GROUP_CONCAT(CONCAT(oi.quantity, 'x ', d.name) SEPARATOR ', ') as items_summary
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       LEFT JOIN dishes d ON d.id = oi.dish_id
       WHERE o.user_id = ?
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Admin: Get all orders
router.get('/all', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT o.*, u.name as customer_name,
        GROUP_CONCAT(CONCAT(oi.quantity, 'x ', d.name) SEPARATOR ', ') as items_summary
       FROM orders o
       JOIN users u ON u.id = o.user_id
       LEFT JOIN order_items oi ON oi.order_id = o.id
       LEFT JOIN dishes d ON d.id = oi.dish_id
       GROUP BY o.id
       ORDER BY o.created_at DESC
       LIMIT 100`
    );
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Admin: Update order status
router.put('/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
  const { status } = req.body;
  try {
    await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Status updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Admin: Sales analytics
router.get('/analytics', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [[{ total_revenue }]] = await db.query(
      "SELECT COALESCE(SUM(total_amount),0) as total_revenue FROM orders WHERE status != 'cancelled'"
    );
    const [[{ active_orders }]] = await db.query(
      "SELECT COUNT(*) as active_orders FROM orders WHERE status IN ('incoming','preparing','out_for_delivery')"
    );
    const [[{ total_customers }]] = await db.query('SELECT COUNT(*) as total_customers FROM users WHERE role="user"');
    const [daily] = await db.query(
      `SELECT DATE(created_at) as date, SUM(total_amount) as revenue, COUNT(*) as order_count
       FROM orders WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) AND status != 'cancelled'
       GROUP BY DATE(created_at) ORDER BY date`
    );
    const [topDishes] = await db.query(
      `SELECT d.name, SUM(oi.quantity) as total_sold, SUM(oi.quantity * oi.unit_price) as revenue
       FROM order_items oi JOIN dishes d ON d.id = oi.dish_id
       GROUP BY d.id ORDER BY total_sold DESC LIMIT 5`
    );
    res.json({ total_revenue, active_orders, total_customers, daily, topDishes });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
