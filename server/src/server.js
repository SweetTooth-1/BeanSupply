const express = require("express");
const productsRouter = require("./routes/product");
const inventoryRouter = require("./routes/inventory");
const pricingRouter = require("./routes/pricing");
const ordersRouter = require("./routes/orders");
const orderItemsRouter = require("./routes/order_items");


const app = express();

const PORT = 3000;

app.get("/", (req, res) => {
    res.send("BeanSupply backend is alive ☕");
});

app.use("/api/products", productsRouter);
app.use("/api/inventory", inventoryRouter);
app.use("/api/pricing", pricingRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/order_items", orderItemsRouter);

app.listen(PORT, () => {
    console.log(`BeanSupply server running on port ${PORT}`);
});