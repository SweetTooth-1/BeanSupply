-- =========================================
-- BeanSupply Database Schema
-- =========================================


-- =========================================
-- 1. Customers
-- =========================================

CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    brand_name VARCHAR(100) NOT NULL,
    contact_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    address VARCHAR(255) NOT NULL,
    business_type VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL
);


-- =========================================
-- 2. Products
-- =========================================

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(200) NOT NULL,
    weight NUMERIC(10,2) NOT NULL,
    unit VARCHAR(10) NOT NULL
);


-- =========================================
-- 3. Inventory
-- =========================================

CREATE TABLE inventory (
    product_id INTEGER PRIMARY KEY REFERENCES products(id),
    quantity_available NUMERIC(10,2) NOT NULL,
    reorder_level NUMERIC(10,2) NOT NULL
);


-- =========================================
-- 4. Customer-specific Pricing
-- =========================================

CREATE TABLE customer_prices (
    customer_id INTEGER NOT NULL REFERENCES customers(id),
    product_id INTEGER NOT NULL REFERENCES products(id),
    price NUMERIC(10,2) NOT NULL,
    UNIQUE (customer_id, product_id)
);


-- =========================================
-- 5. Orders
-- =========================================

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(id),
    order_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL,
    total_amount NUMERIC(12,2) NOT NULL
);


-- =========================================
-- 6. Order Items
-- =========================================

CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id),
    product_id INTEGER NOT NULL REFERENCES products(id),
    quantity NUMERIC(10,2) NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL
);


-- =========================================
-- 7. Payments
-- =========================================

CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id),
    amount NUMERIC(10,2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    payment_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);