# DVSS Food Delivery App

A full-stack food delivery application with a **customer-facing frontend** and a **restaurant admin panel**, built with React + Node.js (Express) + MySQL.
`## Features

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
