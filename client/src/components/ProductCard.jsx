import "./ProductCard.css";
const productImages = {
    "Espresso Blend": "/images/espresso-blend.jpg",
    "Arabica Beans": "/images/arabica-beans.jpg",
    "Decaf": "/images/decaf.jpg",
    "Instant Coffee": "/images/instant-coffee.jpg"
};

function ProductCard({ product, price }) {
    return (
        <article className="product-card">
            <img
    className="product-image"
    src={productImages[product.name]}
    alt={`${product.name} coffee packaging`}
/>
            <h3>{product.name}</h3>

            <p>{product.description}</p>

            <p className="product-weight">
                {product.weight} {product.unit}
            </p>

            <p className="product-price">
    {price != null
        ? `₹${Number(price).toLocaleString("en-IN")}`
        : "Price unavailable"}
            </p>

        </article>
    );
}

export default ProductCard;