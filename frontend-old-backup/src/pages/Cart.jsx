import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCart } from "../context/CartContext";
import Header from "../components/layout/Header";

const Cart = () => {
  const { t } = useTranslation();
  const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();

  // Basic calculation for Demo
  const shipping = 5.0;
  const taxes = cartTotal * 0.16; // 16% Tax Example
  const grandTotal = cartTotal + shipping + taxes;

  return (
    <div className="cart-page-wrapper">
      <Header />

      <main className="cart-page-content container">
        <div className="page-header">
          <h1>{t("cart.shopping_cart", "Shopping Cart")}</h1>
          <div className="breadcrumbs">
            <Link to="/">{t("header.home", "Home")}</Link>
            <span className="separator">/</span>
            <span className="current">
              {t("cart.shopping_cart", "Shopping Cart")}
            </span>
          </div>
        </div>

        {cartItems.length === 0 ? (
          <div className="empty-cart-page">
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
            <h2>{t("cart.empty_title", "Your cart is empty")}</h2>
            <p>
              {t(
                "cart.empty_desc",
                "Looks like you haven't added anything to your cart yet.",
              )}
            </p>
            <Link to="/" className="btn-primary">
              {t("cart.continue_shopping", "Continue Shopping")}
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items-section">
              <div className="table-header hide-mobile">
                <div className="col-product">Product</div>
                <div className="col-price">Price</div>
                <div className="col-qty">Quantity</div>
                <div className="col-subt">Subtotal</div>
                <div className="col-action"></div>
              </div>

              <div className="cart-items-wrapper">
                {cartItems.map((item) => (
                  <div className="cart-item-row" key={item.id}>
                    <div className="col-product">
                      <div className="product-info">
                        <img
                          src={
                            Array.isArray(item.product?.images)
                              ? item.product.images[0]
                              : item.product?.images ||
                                "https://placehold.co/150"
                          }
                          alt={item.product?.title}
                        />
                        <div className="details">
                          <Link to={`/product/${item.product?.slug}`}>
                            {item.product?.title}
                          </Link>
                          {/* Future: Render Variation Badges Here */}
                        </div>
                      </div>
                    </div>

                    <div className="col-price" data-label="Price">
                      ${Number(item.product?.price_usd).toFixed(2)}
                    </div>

                    <div className="col-qty" data-label="Quantity">
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

                    <div className="col-subt" data-label="Subtotal">
                      $
                      {(
                        Number(item.product?.price_usd) * item.quantity
                      ).toFixed(2)}
                    </div>

                    <div className="col-action">
                      <button
                        className="remove-btn"
                        onClick={() => removeFromCart(item.id)}
                        title="Remove item"
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
                    </div>
                  </div>
                ))}
              </div>

              <div className="cart-actions-bottom">
                <div className="coupon-box">
                  <input type="text" placeholder="Coupon Code" />
                  <button className="btn-outline">Apply Coupon</button>
                </div>
              </div>
            </div>

            <div className="cart-summary-section">
              <div className="summary-card">
                <h3>Cart Totals</h3>

                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>

                <div className="summary-row">
                  <span>Tax (16%)</span>
                  <span>${taxes.toFixed(2)}</span>
                </div>

                <div className="summary-row">
                  <span>Shipping</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>

                <div className="summary-divider"></div>

                <div className="summary-row total">
                  <span>Total</span>
                  <span>${grandTotal.toFixed(2)}</span>
                </div>

                <Link to="/checkout" className="btn-primary w-100">
                  Proceed to Checkout
                </Link>

                <div className="payment-icons">
                  {/* Placeholder for trust badges / payment methods */}
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/200px-Visa_Inc._logo.svg.png"
                    alt="Visa"
                  />
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/200px-Mastercard-logo.svg.png"
                    alt="Mastercard"
                  />
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/200px-PayPal.svg.png"
                    alt="PayPal"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Cart;
