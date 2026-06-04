require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const app = express();

// Allow all origins in development; tighten in production
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/dishes', require('./routes/dishes'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/inventory', require('./routes/inventory'));

app.get('/api/health', (req, res) => res.json({ status: 'OK', time: new Date() }));

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

const PORT = process.env.PORT || 5000;

// Test DB connection before starting
db.getConnection()
  .then(conn => {
    console.log('✅ MySQL connected successfully');
    conn.release();
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('❌ MySQL connection FAILED:', err.message);
    process.exit(1);
  });
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD ? 'HAS VALUE' : 'EMPTY');