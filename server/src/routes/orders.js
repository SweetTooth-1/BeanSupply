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
    throw new Error("Only pending orders can be confirmed");
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
        throw new Error(`Insufficient stock for product ${item.product_id}`);
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

    res.status(500).json({
        error: error.message
    });

} finally {
    client.release();
}
});

module.exports = router;