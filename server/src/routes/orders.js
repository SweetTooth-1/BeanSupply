const express = require("express");
const pool = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
    const result = await pool.query(`
        SELECT
    orders.id,
    customers.brand_name,
    orders.order_date,
    orders.status,
    orders.total_amount
FROM orders
JOIN customers
    ON orders.customer_id = customers.id;
    `);

    res.json(result.rows);
});

router.post("/", async (req, res) => {
    const { customerId, items } = req.body;
    if (!Number.isInteger(Number(customerId)) || Number(customerId) <= 0) {
    return res.status(400).json({
        error: "Invalid customer ID"
    });
}

if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
        error: "Order must contain at least one product"
    });
}

for (const item of items) {
    if (
        !item ||
        !Number.isInteger(Number(item.productId)) ||
        Number(item.productId) <= 0 ||
        !Number.isFinite(Number(item.quantity)) ||
        Number(item.quantity) <= 0
    ) {
        return res.status(400).json({
            error: "Invalid product ID or quantity"
        });
    }
}
// Start a transaction
let client;
let transactionStarted = false;

try {
    client = await pool.connect();

    await client.query("BEGIN");
    transactionStarted = true;

    const productIds = items.map(item => Number(item.productId));

const pricingResult = await client.query(
    `SELECT product_id, price
     FROM customer_prices
     WHERE customer_id = $1
     AND product_id = ANY($2::int[])`,
    [Number(customerId), productIds]
);
const pricedItems = [];
let totalAmount = 0;

for (const item of items) {
    const productId = Number(item.productId);
    const quantity = Number(item.quantity);

    const priceRow = pricingResult.rows.find(
        row => Number(row.product_id) === productId
    );

    if (!priceRow) {
        const error = new Error(
            `No negotiated price found for product ${productId}`
        );
        error.statusCode = 409;
        throw error;
    }

    const unitPrice = Number(priceRow.price);

    pricedItems.push({
        productId,
        quantity,
        unitPrice
    });

    totalAmount += quantity * unitPrice;
}

totalAmount = Number(totalAmount.toFixed(2));
const orderResult = await client.query(
    `INSERT INTO orders (customer_id, status, total_amount)
     VALUES ($1, $2, $3)
     RETURNING id`,
    [Number(customerId), "Pending", totalAmount]
);

const orderId = orderResult.rows[0].id;
for (const item of pricedItems) {
    await client.query(
        `INSERT INTO order_items
         (order_id, product_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4)`,
        [
            orderId,
            item.productId,
            item.quantity,
            item.unitPrice
        ]
    );
}
await client.query("COMMIT");
transactionStarted = false;

res.status(201).json({
    message: "Order placed successfully",
    orderId,
    status: "Pending",
    totalAmount
});

} catch (error) {
    if (client && transactionStarted) {
        await client.query("ROLLBACK");
    }

    console.error("Order creation failed:", error);

    res.status(error.statusCode || 500).json({
        error: error.message
    });

} finally {
    if (client) {
        client.release();
    }
}
});

//dedicated DB connection
router.patch("/:orderId/confirm", async (req, res) => {
    const client = await pool.connect();

try {
    await client.query("BEGIN");

    //Identify the order we're confirming
    const orderResult = await client.query(
    `SELECT *
     FROM orders
     WHERE id = $1
     FOR UPDATE`,
    [req.params.orderId]
);

//Validate the order
const order = orderResult.rows[0];

if (!order) {
    throw new Error("Order not found");
}

if (order.status !== "Pending") {
    const error = new Error("Only pending orders can be confirmed");
    error.statusCode = 409;
    throw error;
}

//Retrieve the products in that order
const itemsResult = await client.query(
    `SELECT
        product_id,
        SUM(quantity) AS quantity
     FROM order_items
     WHERE order_id = $1
     GROUP BY product_id
     ORDER BY product_id`,
    [order.id]
);

const items = itemsResult.rows;

if (items.length === 0) {
    throw new Error("Order has no items");
}

//Lock inventory rows and check stock
for (const item of items) {
    const inventoryResult = await client.query(
        `SELECT quantity_available
         FROM inventory
         WHERE product_id = $1
         FOR UPDATE`,
        [item.product_id]
    );

    if (inventoryResult.rows.length === 0) {
        throw new Error(`Inventory record missing for product ${item.product_id}`);
    }

    const availableStock = Number(inventoryResult.rows[0].quantity_available);
    const requiredStock = Number(item.quantity);

    if (availableStock < requiredStock) {
    const error = new Error(
        `Insufficient stock for product ${item.product_id}`
    );
    error.statusCode = 409;
    throw error;
}
}

//deduct the stock from inventory
for (const item of items) {
    await client.query(
        `UPDATE inventory
         SET quantity_available = quantity_available - $1
         WHERE product_id = $2`,
        [item.quantity, item.product_id]
    );
}

//Update the order status to "Confirmed"
await client.query(
    `UPDATE orders
     SET status = 'Confirmed'
     WHERE id = $1`,
    [order.id]
);

//Commit the transaction
await client.query("COMMIT");

res.json({
    message: "Order confirmed successfully",
    orderId: order.id,
    status: "Confirmed"
});

//Complete error handling and rollback in case of failure
} catch (error) {
    await client.query("ROLLBACK");

    console.error("Order confirmation failed:", error);

    const statusCode = error.statusCode || 500;

res.status(statusCode).json({
    error: error.message
});

} finally {
    client.release();
}
});

module.exports = router;