import React from "react";
import "../../../styles/layout/_deal-of-day.scss";

// Mock Data for the grid
const PRODUCTS = [
  {
    id: 1,
    title: "Game Console Controller + USB 3.0 Cable",
    price: 99.99,
    rating: 4.5,
    tag: "NEW", // Blue
    image: "https://via.placeholder.com/200?text=Controller",
  },
  {
    id: 2,
    title: "Samsung CCTV 2.5MP AI-Camera 512GB Storage",
    price: 85.99,
    oldPrice: 98.74,
    rating: 5,
    image: "https://via.placeholder.com/200?text=Camera",
  },
  {
    id: 3,
    title: "Tablet Red EliteBook Revolve 810 G2",
    price: 2100.0,
    rating: 5,
    image: "https://via.placeholder.com/200?text=Tablet",
  },
  {
    id: 4,
    title: "Compact Digital Camera 4K 60fps",
    price: 450.0,
    rating: 4,
    tag: "SALE", // Red
    image: "https://via.placeholder.com/200?text=Camera+Small",
  },
  {
    id: 5,
    title: "Gaming PC Tower Ryzen 7 RTX 3060",
    price: 1250.99,
    rating: 5,
    image: "https://via.placeholder.com/200?text=PC+Tower",
  },
  {
    id: 6,
    title: "Smart Monitor 4K UHD 32 inch",
    price: 399.0,
    oldPrice: 450.0,
    rating: 4.5,
    image: "https://via.placeholder.com/200?text=Monitor",
  },
];

const DealOfTheDay = () => {
  return (
    <section className="deal-of-day-section">
      <div className="container mx-auto">
        {/* Left Column: Banner */}
        <div className="deal-banner">
          <div className="banner-content">
            <span className="banner-badge">Best Drone DJI</span>
            <h2 className="banner-title">15% off all orders over £500</h2>
            <button className="shop-now-btn">Shop Now</button>
          </div>
          <img
            src="https://via.placeholder.com/350x200?text=Drone+Image"
            alt="DJI Drone"
            className="drone-image"
          />
        </div>

        {/* Right Column: Product Grid */}
        <div className="deal-grid-wrapper">
          <div className="section-header">
            <h2>Deal Of The Day</h2>
            <div className="nav-arrows">
              <button aria-label="Previous">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path
                    fillRule="evenodd"
                    d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"
                  />
                </svg>
              </button>
              <button aria-label="Next">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="products-grid">
            {PRODUCTS.map((product) => (
              <div key={product.id} className="deal-product-card">
                {product.tag && (
                  <span className={`card-badge ${product.tag.toLowerCase()}`}>
                    {product.tag}
                  </span>
                )}

                <div className="card-image">
                  <img src={product.image} alt={product.title} />

                  {/* Floating Action Buttons */}
                  <div className="action-buttons">
                    <button className="action-btn" aria-label="Add to Cart">
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
                          d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 5.059c.263 1.346.395 2.019-.056 2.54-.452.521-1.14.521-2.515.521H7.702c-1.374 0-2.061 0-2.515-.521-.452-.52-.319-1.194-.056-2.54l1.263-5.06c.14-.56.21-.84.4-.985.19-.145.49-.145.727-.145h8.956c.238 0 .537 0 .727.145.19.145.26.426.4.985Z"
                        />
                      </svg>
                    </button>
                    <button className="action-btn" aria-label="Add to Wishlist">
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
                          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                        />
                      </svg>
                    </button>
                    <button className="action-btn" aria-label="Compare">
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
                          d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                        />
                      </svg>
                    </button>
                    <button className="action-btn" aria-label="Quick View">
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
                          d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="card-details">
                  <h3 className="product-title">
                    <a href="#">{product.title}</a>
                  </h3>

                  <div className="rating">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        style={{
                          color:
                            i < Math.floor(product.rating) ? "#f1c40f" : "#ddd",
                        }}
                      >
                        ★
                      </span>
                    ))}
                  </div>

                  <div className="price">
                    ${product.price.toFixed(2)}
                    {product.oldPrice && (
                      <span className="old-price">
                        ${product.oldPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DealOfTheDay;
