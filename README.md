# DVSS Food Delivery App

A full-stack food delivery application with a **customer-facing frontend** and a **restaurant admin panel**, built with React + Node.js (Express) + MySQL.

---

## Project Structure

```
food-delivery/
├── backend/          ← Node.js + Express API
│   ├── config/
│   │   ├── db.js          ← MySQL connection pool
│   │   └── schema.sql     ← Database schema + seed data
│   ├── middleware/
│   │   └── auth.js        ← JWT auth + admin guard
│   ├── routes/
│   │   ├── auth.js        ← /api/auth  (login, register)
│   │   ├── dishes.js      ← /api/dishes
│   │   ├── orders.js      ← /api/orders
│   │   ├── cart.js        ← /api/cart
│   │   ├── chat.js        ← /api/chat
│   │   └── inventory.js   ← /api/inventory
│   ├── server.js
│   ├── .env.example
│   └── package.json
│
└── frontend/         ← React + Vite app
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── AuthPage.jsx          ← Login / Register (DVSS design)
    │   │   ├── UserLayout.jsx        ← User navbar + routing
    │   │   ├── AdminLayout.jsx       ← Admin sidebar + routing
    │   │   ├── user/
    │   │   │   ├── HomePage.jsx      ← Browse & search dishes
    │   │   │   ├── OrdersPage.jsx    ← Order history
    │   │   │   ├── CartPage.jsx      ← Cart + checkout
    │   │   │   ├── LocationPage.jsx  ← Delivery addresses
    │   │   │   └── PaymentPage.jsx   ← Payment mode selection
    │   │   └── admin/
    │   │       ├── AdminDashboard.jsx     ← Stats, recent orders
    │   │       ├── InventoryPage.jsx      ← Dish inventory + order history
    │   │       ├── SalesAnalytics.jsx     ← Revenue charts
    │   │       ├── OrderManagement.jsx    ← All orders, status updates
    │   │       ├── ChatAdmin.jsx          ← Customer support chat
    │   │       └── DeliveryDashboard.jsx  ← Live delivery tracking
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## Setup Instructions

### 1. MySQL Database

```sql
-- In MySQL Workbench or terminal:
mysql -u root -p < backend/config/schema.sql
```

This creates the `food_delivery` database, all tables, seeds 10 default dishes, and creates a default admin user.

**Default admin credentials:**
- Email: `admin@eatsadmin.com`
- Password: `password` *(update after first login)*

---

### 2. Backend Setup

```bash
cd backend

# Copy and fill in your env variables
cp .env.example .env
# Edit .env:
#   DB_HOST=localhost
#   DB_USER=root
#   DB_PASSWORD=your_mysql_password
#   DB_NAME=food_delivery
#   JWT_SECRET=some_long_random_string

npm install
npm run dev        # Development (nodemon)
# or
npm start          # Production
```

Backend runs on **http://localhost:5000**

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on **http://localhost:5173**

*(Vite proxies all `/api` calls to `localhost:5000` automatically.)*

---

## Features

### Customer (User)
| Page | Features |
|------|----------|
| Auth | Register/login with name, email, password, role dropdown |
| Home | Browse dishes, search by name/category/cuisine, filter by category, add to cart |
| Orders | View order history, search by dish/ID, status badges |
| Cart | Adjust quantities, remove items, enter delivery address, choose payment, place order |
| Location | Saved addresses, add new address |
| Payment | Cash on Delivery, Card, UPI |

### Admin (Restaurant Panel)
| Page | Features |
|------|----------|
| Dashboard | Revenue, active orders, customer count, recent orders table, quick actions |
| Inventory | All dishes with total units sold, order count, revenue — toggle availability |
| Sales Analytics | KPIs, daily revenue bar chart, top dishes |
| Order Management | All orders, filter by status, search, update order status via dropdown |
| Chat | View all customer conversations, reply to messages |
| Delivery Dashboard | Live view of incoming/preparing/out-for-delivery orders, dispatch buttons |

---

## API Endpoints

```
POST /api/auth/register
POST /api/auth/login

GET  /api/dishes          ?search=&category=
POST /api/dishes          (admin)
PUT  /api/dishes/:id      (admin)
DELETE /api/dishes/:id    (admin)

GET  /api/orders/my
POST /api/orders
GET  /api/orders/all      (admin)
PUT  /api/orders/:id/status  (admin)
GET  /api/orders/analytics   (admin)

GET  /api/cart
POST /api/cart
PUT  /api/cart/:id
DELETE /api/cart/:id

GET  /api/chat
POST /api/chat
GET  /api/chat/admin/all    (admin)
POST /api/chat/admin/reply  (admin)

GET  /api/inventory         (admin)
PUT  /api/inventory/:id/toggle  (admin)
```
