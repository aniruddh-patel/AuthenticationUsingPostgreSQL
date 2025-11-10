# 🛒 E-Commerce Backend System

## 📘 Overview
This project implements the **backend** of an e-commerce platform, focusing primarily on **API development** and **database management**.

The platform supports **two types of users**:
- **Customers**
- **Sellers**

Each user type has its **own authentication system** and set of APIs for secure and efficient interactions.

---

## 🧰 Technologies Used
| Technology | Purpose |
|-------------|----------|
| **Node.js** | Backend runtime environment |
| **Express.js** | Server framework for routing and middleware |
| **MongoDB** | NoSQL database for dynamic data (products, cart) |
| **PostgreSQL** | Relational database for structured data (users, sellers, orders, tokens) |
| **JWT / Token-based Auth** | Initially JWT, later migrated to database token persistence for better control |

---

## 🗄️ Database Structure

### **MongoDB Collections**
| Collection | Description |
|-------------|-------------|
| **Products** | Stores product details added by sellers |
| **Cart** | Stores items added to the user’s cart |

### **PostgreSQL Tables**
| Table | Description |
|--------|-------------|
| **Users** | Stores customer account details |
| **Sellers** | Stores seller account details |
| **Orders** | Stores order information and statuses (`pending`, `delivered`, `cancelled`) |
| **User_Tokens** | Stores authentication tokens to manage active sessions |

---

#### **1️⃣ user_info**
Stores **customer account details**.

| Column | Type | Nullable | Default |
|---------|------|-----------|----------|
| user_id | integer | not null | `nextval('user_auth_user_id_seq'::regclass)` |
| user_email | character varying(255) | not null |  |
| user_name | character varying(100) | not null |  |
| password_hash | text | not null |  |
| phone | character varying(15) | not null |  |
| address | text | not null |  |
| gender | character varying(10) |  |  |
| is_active | boolean |  | `true` |
| created_at | timestamp without time zone |  | `CURRENT_TIMESTAMP` |
| account_type | character varying(255) |  | `'customer'::character varying` |

---

#### **2️⃣ seller_info**
Stores **seller account and business details**.

| Column | Type | Nullable | Default |
|---------|------|-----------|----------|
| seller_id | character varying(10) | not null |  |
| seller_name | character varying(100) | not null |  |
| seller_email | character varying(255) | not null |  |
| password_hash | text | not null |  |
| gst_number | character varying(20) | not null |  |
| shop_name | character varying(100) | not null |  |
| shop_address | text | not null |  |
| phone_number | character varying(15) | not null |  |
| verified | boolean |  | `false` |
| is_active | boolean |  | `true` |
| account_type | character varying(255) |  | `'seller'::character varying` |

---

#### **3️⃣ order_table**
Stores **order information** for each user and product.

| Column | Type | Nullable | Default |
|---------|------|-----------|----------|
| order_id | integer | not null | `nextval('order_table_order_id_seq'::regclass)` |
| product_id | character varying(50) | not null |  |
| user_id | integer | not null |  |
| order_timestamp | timestamp without time zone |  | `CURRENT_TIMESTAMP` |
| status | character varying(20) |  | `'pending'::character varying` |
| delivered_date | timestamp without time zone |  |  |

---

#### **4️⃣ user_tokens**
Stores **user session tokens** for authentication persistence.

| Column | Type | Nullable | Default |
|---------|------|-----------|----------|
| token_id | integer | not null | `nextval('user_tokens_token_id_seq'::regclass)` |
| user_id | integer | not null |  |
| token | text | not null |  |
| created_at | timestamp without time zone |  | `CURRENT_TIMESTAMP` |

---


## 🔐 Authentication System
- Initially implemented with **JWT-based authentication**.
- Enhanced later with **database token persistence** for improved session control using the `user_tokens` table.
  
### Middlewares
| Middleware | Purpose |
|-------------|----------|
| **UserAuthToken** | Validates customer session tokens |
| **SellerAuthToken** | Validates seller session tokens |

---

## 🚀 API Routes Overview

### 👤 User Routes (`/api/v1/user`)
| Method | Endpoint | Middleware | Description |
|--------|-----------|-------------|-------------|
| POST | `/account/login` | – | Logs in user |
| POST | `/account/signup` | – | Registers new user |
| POST | `/account/reactivate` | – | Reactivates user account |
| GET | `/account/profile` | `UserAuthToken` | Fetch user profile |
| POST | `/account/logout` | `UserAuthToken` | Logs out user |
| PUT | `/account/update` | `UserAuthToken` | Updates user info |
| DELETE | `/account/delete` | `UserAuthToken` | Deletes user account |

---

### 🏬 Seller Routes (`/api/v1/seller`)
| Method | Endpoint | Middleware | Description |
|--------|-----------|-------------|-------------|
| POST | `/account/login` | – | Logs in seller |
| POST | `/account/signup` | – | Registers new seller |
| POST | `/account/reactivate` | – | Reactivates seller account |
| GET | `/account/profile` | `SellerAuthToken` | Fetch seller profile |
| POST | `/account/logout` | `SellerAuthToken` | Logs out seller |
| PUT | `/account/update` | `SellerAuthToken` | Updates seller details |
| DELETE | `/account/delete` | `SellerAuthToken` | Deletes seller account |

---

### 🛍️ Product Routes (`/api/v1/product`)
| Method | Endpoint | Middleware | Description |
|--------|-----------|-------------|-------------|
| GET | `/items` | – | List all products |
| GET | `/item/:id` | – | Get product details by ID |
| GET | `/account/myitems` | `SellerAuthToken` | List seller’s products |
| POST | `/create` | `SellerAuthToken` | Create new product |
| PUT | `/update/:id` | `SellerAuthToken` | Update product |
| DELETE | `/delete/:id` | `SellerAuthToken` | Delete product |

---

### 📦 Order Routes
| Method | Endpoint | Middleware | Description |
|--------|-----------|-------------|-------------|
| GET | `/items` | `UserAuthToken` | List all user orders |
| POST | `/create/:id` | `UserAuthToken` | Create new order for product ID |
| DELETE | `/cancel/:id` | `UserAuthToken` | Cancel existing order |
| PUT | `/delivered/:id` | `UserAuthToken` | Mark order as delivered |

---

### 🛒 Cart Routes
| Method | Endpoint | Middleware | Description |
|--------|-----------|-------------|-------------|
| GET | `/items` | `UserAuthToken` | View cart items |
| POST | `/add/:productId` | `UserAuthToken` | Add product to cart |
| DELETE | `/remove/all` | `UserAuthToken` | Clear cart |
| DELETE | `/remove/:productId` | `UserAuthToken` | Remove specific product |

---

### 📊 Report Route
| Method | Endpoint | Middleware | Description |
|--------|-----------|-------------|-------------|
| GET | `/getdata` | `SellerAuthToken` | Generate seller sales report (pending & delivered orders) |
| GET | `/all`     |                   | Generate all seller sales report (pending, cancelled & delivered orders) |
---

## ⚙️ Core Functionalities
- ✅ User Authentication & Profile Management  
- ✅ Seller Authentication & Profile Management & Product Management  
- ✅ Cart and Order System  
- ✅ Dynamic Report Generation for Sellers  
- ✅ Database-based Token Management for Persistent Sessions  

---

## 🧪 Setup Instructions

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/aniruddh-patel/AuthenticationUsingPostgreSQL
cd AuthenticationUsingPostgreSQL
