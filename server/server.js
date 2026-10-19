const express = require("express");
const pool = require("./db");
const app = express();

const PORT = 3000;

app.get("/", (req, res) => {
    res.send("BeanSupply backend is alive ☕");
});

app.get("/api/products", async (req, res) => {
    const result = await pool.query("SELECT * FROM products");
    res.json(result.rows);
});

app.listen(PORT, () => {
    console.log(`BeanSupply server running on port ${PORT}`);
});