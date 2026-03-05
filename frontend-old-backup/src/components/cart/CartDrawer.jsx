import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCart } from "../../context/CartContext";

const CartDrawer = () => {
  const { t } = useTranslation();
  const {
    isDrawerOpen,
    toggleDrawer,
    cartItems,
    removeFromCart,
    updateQuantity,
    cartTotal,
  } = useCart();

  return (
    <>
      <div
        className={`cart-overlay ${isDrawerOpen ? "open" : ""}`}
        onClick={toggleDrawer}
      />
      <aside className={`cart-drawer ${isDrawerOpen ? "open" : ""}`}>
        <div className="cart-header">
          <h2>{t("cart.shopping_cart", "Shopping Cart")}</h2>
          <button className="close-btn" onClick={toggleDrawer}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="cart-body">
          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="empty-icon"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                />
              </svg>
              <p>{t("cart.empty", "Your cart is currently empty.")}</p>
              <button className="btn-primary" onClick={toggleDrawer}>
                {t("cart.continue_shopping", "Continue Shopping")}
              </button>
            </div>
          ) : (
            <ul className="cart-items-list">
              {cartItems.map((item) => (
                <li key={item.id} className="cart-item">
                  <div className="item-image">
                    {/* Parse image if array or string */}
                    <img
                      src={
                        Array.isArray(item.product?.images)
                          ? item.product.images[0]
                          : item.product?.images || "https://placehold.co/100"
                      }
                      alt={item.product?.title}
                    />
                  </div>
                  <div className="item-details">
                    <h4>{item.product?.title}</h4>
                    <span className="price">
                      ${Number(item.product?.price_usd).toFixed(2)}
                    </span>
                    <div className="quantity-controls">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    className="remove-btn"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-footer">
            <div className="subtotal">
              <span>{t("cart.subtotal", "Subtotal")}</span>
              <span className="amount">${cartTotal.toFixed(2)}</span>
            </div>
            <div className="cart-actions">
              <Link to="/cart" className="btn-outline" onClick={toggleDrawer}>
                {t("cart.view_cart", "View Cart")}
              </Link>
              <Link
                to="/checkout"
                className="btn-primary"
                onClick={toggleDrawer}
              >
                {t("cart.checkout", "Checkout")}
              </Link>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default CartDrawer;
