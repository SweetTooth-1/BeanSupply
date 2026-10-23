const express = require("express");
const pool = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
    const result = await pool.query(`
        SELECT
            inventory.product_id,
            products.name AS product_name,
            inventory.quantity_available,
            inventory.reorder_level
        FROM inventory
        JOIN products
        ON inventory.product_id = products.id
    `);

    res.json(result.rows);
});

module.exports = router;