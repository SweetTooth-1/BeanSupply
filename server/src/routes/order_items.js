const express = require("express");
const pool = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
    const result = await pool.query(`
        SELECT
    order_items.order_id,
    products.name AS product_name,
    order_items.quantity,
    order_items.unit_price
FROM order_items
JOIN products
    ON order_items.product_id = products.id;
    `);

    res.json(result.rows);
});

module.exports = router;