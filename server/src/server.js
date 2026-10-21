const express = require("express");
const productsRouter = require("./routes/product");

const app = express();

const PORT = 3000;

app.get("/", (req, res) => {
    res.send("BeanSupply backend is alive ☕");
});

app.use("/api/products", productsRouter);

app.listen(PORT, () => {
    console.log(`BeanSupply server running on port ${PORT}`);
});