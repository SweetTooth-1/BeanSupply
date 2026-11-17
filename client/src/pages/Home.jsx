import "./Home.css";
import ProductCatalogue from "../components/ProductCatalogue";
function Home() {
    return (
        <main>
            <section className="hero" id="home">
                <div className="hero-content">
                    <p className="hero-label">
                        WHOLESALE COFFEE, SIMPLIFIED
                    </p>

                    <h1>
                        Great coffee.
                        <br />
                        Smarter wholesale.
                    </h1>

                    <p className="hero-description">
                        Quality coffee for businesses that care
                        about every cup. Explore our collection
                        and order with ease.
                    </p>

                    <a href="#catalogue" className="hero-button">
                        Explore Our Coffee
                    </a>
                </div>
            </section>
            <ProductCatalogue />
        </main>
    );
}

export default Home;