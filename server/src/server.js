const express = require("express");
const productsRouter = require("./routes/product");
const inventoryRouter = require("./routes/inventory");

const app = express();

const PORT = 3000;

app.get("/", (req, res) => {
    res.send("BeanSupply backend is alive ☕");
});

app.use("/api/products", productsRouter);
app.use("/api/inventory", inventoryRouter);

app.listen(PORT, () => {
    console.log(`BeanSupply server running on port ${PORT}`);
});