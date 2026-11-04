const express = require("express");
const pool = require("../db");

const router = express.Router();

router.get("/:customerId", async (req, res) => {
    const customerId = req.params.customerId;

    const result = await pool.query(`
        SELECT
            customer_prices.product_id,
            products.name AS product_name,
            customer_prices.price
        FROM customer_prices
        JOIN products
            ON customer_prices.product_id = products.id
        WHERE customer_prices.customer_id = $1
    `, [customerId]);

    res.json(result.rows);
});

module.exports = router;