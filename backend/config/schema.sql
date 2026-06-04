-- Run this SQL in your MySQL database to set up the schema

CREATE DATABASE IF NOT EXISTS food_delivery;
USE food_delivery;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dishes / Menu items
CREATE TABLE IF NOT EXISTS dishes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(50),
  image_url VARCHAR(255),
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status ENUM('incoming', 'preparing', 'out_for_delivery', 'delivered', 'cancelled') DEFAULT 'incoming',
  delivery_address TEXT,
  payment_mode ENUM('cash', 'card', 'upi') DEFAULT 'cash',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Order items
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  dish_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (dish_id) REFERENCES dishes(id)
);

-- Cart
CREATE TABLE IF NOT EXISTS cart (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  dish_id INT NOT NULL,
  quantity INT DEFAULT 1,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (dish_id) REFERENCES dishes(id),
  UNIQUE KEY unique_cart_item (user_id, dish_id)
);

-- Messages (chat)
CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  sender ENUM('user', 'admin') NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Seed default dishes
INSERT IGNORE INTO dishes (name, description, price, category, image_url) VALUES
('Margherita Pizza', 'Classic tomato, mozzarella, basil', 12.99, 'Pizza', 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=300'),
('Chicken Burger', 'Crispy fried chicken with lettuce & sauce', 9.99, 'Burgers', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300'),
('Veg Fried Rice', 'Wok-tossed rice with seasonal vegetables', 8.49, 'Rice', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300'),
('Paneer Tikka', 'Tandoor-grilled cottage cheese with spices', 10.99, 'Starters', 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=300'),
('Caesar Salad', 'Romaine, croutons, parmesan, caesar dressing', 7.99, 'Salads', 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=300'),
('Masala Dosa', 'Crispy rice crepe with spiced potato filling', 6.99, 'South Indian', 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=300'),
('Chocolate Brownie', 'Warm fudge brownie with vanilla ice cream', 5.99, 'Desserts', 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=300'),
('Mango Lassi', 'Sweet yogurt drink with fresh mango', 3.99, 'Beverages', 'https://images.unsplash.com/photo-1571196284557-92ab44afc298?w=300'),
('Butter Chicken', 'Creamy tomato-based chicken curry', 13.99, 'Curries', 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=300'),
('Veggie Wrap', 'Grilled vegetables in a whole wheat tortilla', 8.99, 'Wraps', 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=300');

-- Seed admin user (password: admin123)
INSERT IGNORE INTO users (name, email, password, role) VALUES
('Admin', 'admin@eatsadmin.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');
