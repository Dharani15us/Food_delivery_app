require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./config/db');

async function seed() {
  console.log('🌱 Starting seed...');

  try {
    // Clear existing data (safe re-seed)
    await db.query('SET FOREIGN_KEY_CHECKS = 0');
    await db.query('TRUNCATE TABLE order_items');
    await db.query('TRUNCATE TABLE orders');
    await db.query('TRUNCATE TABLE cart');
    await db.query('TRUNCATE TABLE messages');
    await db.query('TRUNCATE TABLE dishes');
    await db.query('TRUNCATE TABLE users');
    await db.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ Tables cleared');

    // Seed users
    const adminPass = await bcrypt.hash('admin123', 10);
    const userPass  = await bcrypt.hash('user123', 10);

    const [adminRes] = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Admin', 'admin@eatsadmin.com', adminPass, 'admin']
    );
    const [u1] = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Alice Freeman', 'alice@example.com', userPass, 'user']
    );
    const [u2] = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['John Doe', 'john@example.com', userPass, 'user']
    );
    const [u3] = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Emily Smith', 'emily@example.com', userPass, 'user']
    );
    console.log('✅ Users seeded');

    // Seed dishes
    const dishes = [
      ['Margherita Pizza', 'Classic tomato base with fresh mozzarella, basil leaves and a drizzle of olive oil', 12.99, 'Pizza', 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&q=80'],
      ['Pepperoni Pizza', 'Loaded with spicy pepperoni slices on a rich tomato and cheese base', 14.99, 'Pizza', 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&q=80'],
      ['Chicken Burger', 'Crispy fried chicken fillet with lettuce, tomato and signature sauce', 9.99, 'Burgers', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80'],
      ['BBQ Beef Burger', 'Juicy beef patty with smoky BBQ sauce, caramelised onions and cheddar', 11.99, 'Burgers', 'https://images.unsplash.com/photo-1550317138-10000687a72b?w=400&q=80'],
      ['Veg Fried Rice', 'Wok-tossed basmati rice with seasonal vegetables and soy sauce', 8.49, 'Rice', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&q=80'],
      ['Chicken Biryani', 'Fragrant basmati rice slow-cooked with tender chicken and whole spices', 13.49, 'Rice', 'https://images.unsplash.com/photo-1563379091339-03246963d51a?w=400&q=80'],
      ['Paneer Tikka', 'Tandoor-grilled cottage cheese marinated in yoghurt and aromatic spices', 10.99, 'Starters', 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&q=80'],
      ['Chicken Wings', 'Crispy wings tossed in hot buffalo sauce, served with blue cheese dip', 9.49, 'Starters', 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400&q=80'],
      ['Caesar Salad', 'Crisp romaine, croutons, parmesan and classic caesar dressing', 7.99, 'Salads', 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400&q=80'],
      ['Greek Salad', 'Tomatoes, cucumber, olives, red onion and feta with olive oil dressing', 8.49, 'Salads', 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&q=80'],
      ['Masala Dosa', 'Crispy rice-lentil crepe filled with spiced potato masala, served with chutneys', 6.99, 'South Indian', 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400&q=80'],
      ['Idli Sambar', 'Steamed rice cakes served with lentil vegetable stew and coconut chutney', 5.99, 'South Indian', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&q=80'],
      ['Chocolate Brownie', 'Warm dense fudge brownie with a scoop of vanilla ice cream', 5.99, 'Desserts', 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=400&q=80'],
      ['Gulab Jamun', 'Soft milk-solid dumplings soaked in rose-cardamom sugar syrup', 4.49, 'Desserts', 'https://images.unsplash.com/photo-1601303516534-bf9a1abc6f7b?w=400&q=80'],
      ['Mango Lassi', 'Thick chilled yoghurt drink blended with fresh Alphonso mango pulp', 3.99, 'Beverages', 'https://images.unsplash.com/photo-1571196284557-92ab44afc298?w=400&q=80'],
      ['Cold Coffee', 'Chilled espresso blended with milk, ice and a hint of vanilla', 3.49, 'Beverages', 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80'],
      ['Butter Chicken', 'Tender chicken in a velvety tomato-cream sauce with butter and fenugreek', 13.99, 'Curries', 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&q=80'],
      ['Dal Makhani', 'Slow-cooked black lentils in a rich buttery tomato gravy', 11.49, 'Curries', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&q=80'],
      ['Veggie Wrap', 'Grilled peppers, zucchini and hummus wrapped in a whole-wheat tortilla', 8.99, 'Wraps', 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&q=80'],
      ['Chicken Shawarma', 'Spiced chicken strips with garlic sauce and pickles in a soft wrap', 9.99, 'Wraps', 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&q=80'],
    ];

    const dishIds = [];
    for (const [name, desc, price, cat, img] of dishes) {
      const [r] = await db.query(
        'INSERT INTO dishes (name, description, price, category, image_url) VALUES (?,?,?,?,?)',
        [name, desc, price, cat, img]
      );
      dishIds.push(r.insertId);
    }
    console.log(`✅ ${dishes.length} dishes seeded`);

    // Seed sample orders
    const sampleOrders = [
      {
        user_id: u1.insertId,
        items: [{ dish: 0, qty: 2 }, { dish: 7, qty: 1 }],  // Margherita x2, Wings x1
        address: '42, Anna Nagar, Chennai - 600040',
        payment: 'card',
        status: 'delivered'
      },
      {
        user_id: u2.insertId,
        items: [{ dish: 5, qty: 1 }, { dish: 14, qty: 2 }], // Biryani x1, Lassi x2
        address: 'Tidel Park, Taramani, Chennai - 600113',
        payment: 'upi',
        status: 'delivered'
      },
      {
        user_id: u3.insertId,
        items: [{ dish: 8, qty: 1 }, { dish: 11, qty: 1 }], // Caesar Salad, Idli
        address: '15, T Nagar, Chennai - 600017',
        payment: 'cash',
        status: 'delivered'
      },
      {
        user_id: u1.insertId,
        items: [{ dish: 16, qty: 1 }, { dish: 3, qty: 1 }], // Butter Chicken, BBQ Burger
        address: '42, Anna Nagar, Chennai - 600040',
        payment: 'card',
        status: 'preparing'
      },
      {
        user_id: u2.insertId,
        items: [{ dish: 2, qty: 2 }, { dish: 15, qty: 1 }], // Chicken Burger x2, Cold Coffee
        address: 'Tidel Park, Taramani, Chennai - 600113',
        payment: 'upi',
        status: 'out_for_delivery'
      },
      {
        user_id: u3.insertId,
        items: [{ dish: 18, qty: 1 }, { dish: 19, qty: 1 }], // Veggie Wrap, Shawarma
        address: '15, T Nagar, Chennai - 600017',
        payment: 'cash',
        status: 'incoming'
      },
    ];

    for (const o of sampleOrders) {
      const total = o.items.reduce((sum, i) => sum + dishes[i.dish][2] * i.qty, 0);
      const [oRes] = await db.query(
        'INSERT INTO orders (user_id, total_amount, status, delivery_address, payment_mode) VALUES (?,?,?,?,?)',
        [o.user_id, total.toFixed(2), o.status, o.address, o.payment]
      );
      for (const item of o.items) {
        await db.query(
          'INSERT INTO order_items (order_id, dish_id, quantity, unit_price) VALUES (?,?,?,?)',
          [oRes.insertId, dishIds[item.dish], item.qty, dishes[item.dish][2]]
        );
      }
    }
    console.log(`✅ ${sampleOrders.length} sample orders seeded`);

    console.log('\n🎉 Seed complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin login  →  admin@eatsadmin.com / admin123');
    console.log('User login   →  alice@example.com   / user123');
    console.log('             →  john@example.com    / user123');
    console.log('             →  emily@example.com   / user123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    process.exit(0);
  }
}

seed();
