# Mallela Milks 🥛

Mallela Milks is a full-stack dairy e-commerce web application developed as a portfolio project.

The application allows customers to browse dairy products, register/login, add products to a cart, place orders, view previous orders, cancel pending orders, submit reviews, and contact the business.

## 🌐 Live Demo

**Live Website:**  
https://manoj8247.github.io/mallelaproject/

> Note: The project uses free-tier cloud services. The backend and database may take some time to wake up after a period of inactivity.

---

## ✨ Features

### 👤 User Authentication

- User registration
- User login/logout
- Password hashing
- Session-based authentication
- Protected customer operations

### 🥛 Products

- Products are loaded dynamically from the database
- Product name, price, image, and unit are stored in MySQL
- New products can be added or existing products can be modified through the database without changing the frontend

### 🛒 Shopping Cart

- Add products to cart
- Increase/decrease quantity
- Remove products
- Automatic subtotal calculation
- Delivery charge calculation
- Checkout validation

### 📦 Orders

- Place orders
- Store customer and order information in MySQL
- View current orders
- View previous orders
- Cancel orders while they are in `Pending` status
- Order status tracking:
  - Pending
  - Processing
  - Out for Delivery

### ⭐ Reviews

- Logged-in users can submit reviews
- 1–5 star rating system
- Reviews are stored in MySQL
- Newest reviews are displayed first
- View more reviews functionality

### 📩 Contact

- Customers can submit contact messages
- Messages are stored in MySQL

---

## 🛠️ Technologies Used

### Frontend

- HTML5
- CSS3
- JavaScript
- Bootstrap

### Backend

- Python
- Flask
- Flask-CORS
- Gunicorn

### Database

- MySQL
- MySQL Connector/Python

### Security

- Werkzeug password hashing
- Flask sessions
- HTTP-only session cookies
- Production CORS configuration
- Environment variables for sensitive configuration

### Deployment

- GitHub Pages - Frontend
- Render - Flask Backend
- Aiven - MySQL Database

---

## 🏗️ Project Architecture

```text
                 ┌──────────────────────┐
                 │     GitHub Pages     │
                 │   HTML / CSS / JS    │
                 └──────────┬───────────┘
                            │
                            │ REST API
                            ▼
                 ┌──────────────────────┐
                 │       Render         │
                 │   Flask + Gunicorn   │
                 └──────────┬───────────┘
                            │
                            │ MySQL Connection
                            ▼
                 ┌──────────────────────┐
                 │       Aiven          │
                 │    MySQL Database    │
                 └──────────────────────┘
