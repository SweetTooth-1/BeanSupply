import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import "./ProductCatalogue.css";

function ProductCatalogue() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [prices, setPrices] = useState([]);

    useEffect(() => {
        async function fetchProducts() {
            try {
                const response = await fetch("/api/products");

                if (!response.ok) {
                    throw new Error("Failed to fetch products");
                }

                const data = await response.json();
                setProducts(data);

            } catch (error) {
                setError(error.message);

            } finally {
                setLoading(false);
            }
        }

        fetchProducts();
    }, []);

useEffect(() => {
    async function fetchPrices() {
        try {
            const response = await fetch("/api/pricing/2");

            if (!response.ok) {
                throw new Error("Failed to fetch prices");
            }

            const data = await response.json();
            setPrices(data);

        } catch (error) {
            setError(error.message);
        }
    }

    fetchPrices();
}, []);

    if (loading) return <p>Loading products...</p>;

    if (error) return <p>{error}</p>;

    return (
        <section id="catalogue">
            <h2>Our Coffee</h2>

            <div className="product-grid">

                {products.map(product => {
    const customerPrice = prices.find(
        price => Number(price.product_id) === product.id
    );

    return (
        <ProductCard
            key={product.id}
            product={product}
            price={customerPrice?.price}
        />
    );
})}
            </div>
        </section>
    );
}

export default ProductCatalogue;