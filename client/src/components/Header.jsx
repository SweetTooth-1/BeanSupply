import "./Header.css";

function Header() {
    return (
        <header className="site-header">
            <div className="brand">
                BeanSupply
            </div>

            <nav className="navigation">
                <a href="#home">Home</a>
                <a href="#catalogue">Our Coffee</a>
                <a href="#orders">My Orders</a>
            </nav>

            <div className="header-actions">
                <button className="cart-button">
                    Cart (0)
                </button>
            </div>
        </header>
    );
}

export default Header;