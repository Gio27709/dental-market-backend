import React, { useState } from "react";
import "../../../styles/layout/_top-selling.scss";

// Mock Data
const ALL_PRODUCTS = [
  {
    id: 1,
    title: "Intex slim SUHD TV with USB Port wifi",
    price: 1100.2,
    rating: 4.5,
    tag: "NEW", // Blue
    img: "https://via.placeholder.com/200?text=TV+1",
    category: "Television",
  },
  {
    id: 2,
    title: "Samsung 4k LED Gadea Smart TV",
    price: 1450.2,
    rating: 4.0,
    img: "https://via.placeholder.com/200?text=TV+2",
    category: "Television",
  },
  {
    id: 3,
    title: "Panasonic LED-backlit TV with Speaker",
    price: 1380.6,
    rating: 4.5,
    tag: "SALE",
    img: "https://via.placeholder.com/200?text=TV+3",
    category: "Television",
  },
  {
    id: 4,
    title: "4K resolution Ultra-high-definition",
    price: 1830.89,
    rating: 4.5,
    img: "https://via.placeholder.com/200?text=TV+4",
    category: "Television",
  },
  {
    id: 5,
    title: "Samsung MU7000 4K resolution Ultra-high-def",
    price: 427.3,
    oldPrice: 567.74,
    rating: 4.5,
    tag: "NEW",
    img: "https://via.placeholder.com/200?text=TV+5",
    category: "Television",
  },
  {
    id: 6,
    title: "LG OLED C1 Series 4K Smart TV",
    price: 2499.0,
    rating: 5.0,
    tag: "NEW",
    img: "https://via.placeholder.com/200?text=TV+6",
    category: "Television",
  },
  {
    id: 7,
    title: "Sony Bravia XR A80J OLED TV",
    price: 1999.99,
    oldPrice: 2299.99,
    rating: 4.8,
    tag: "SALE",
    img: "https://via.placeholder.com/200?text=TV+7",
    category: "Television",
  },
  {
    id: 8,
    title: "Vizio V-Series 4K HDR Smart TV",
    price: 399.99,
    rating: 4.2,
    img: "https://via.placeholder.com/200?text=TV+8",
    category: "Television",
  },
];

const TABS = ["Television", "Headphones", "Smartphone", "Laptops"];

const TopSelling = () => {
  const [activeTab, setActiveTab] = useState("Television");
  const [startIndex, setStartIndex] = useState(0);

  // Filter products (demo: mainly just returning all for TV, or filtering if we had others)
  const displayProducts = ALL_PRODUCTS; // In real app: ALL_PRODUCTS.filter(p => p.category === activeTab)

  const itemsToShow = 5;
  const maxIndex = Math.max(0, displayProducts.length - itemsToShow);

  const nextSlide = () => {
    if (startIndex < maxIndex) {
      setStartIndex(startIndex + 1);
    }
  };

  const prevSlide = () => {
    if (startIndex > 0) {
      setStartIndex(startIndex - 1);
    }
  };

  // Get visible slice
  const visibleProducts = displayProducts.slice(
    startIndex,
    startIndex + itemsToShow,
  );

  return (
    <section className="top-selling-section">
      <div className="container mx-auto">
        {/* Header with Title and Tabs */}
        <div className="section-header">
          <h2 className="section-title">Top Selling</h2>

          <div className="tabs-container">
            {TABS.map((tab) => (
              <button
                key={tab}
                className={`tab-btn ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Product Carousel / Grid */}
        <div className="products-carousel-wrapper">
          {/* Navigation Buttons */}
          <button
            className={`nav-btn prev ${startIndex === 0 ? "disabled" : ""}`}
            onClick={prevSlide}
            disabled={startIndex === 0}
            aria-label="Previous"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd"
                d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 0-.708 0z"
              />
            </svg>
          </button>

          <div className="products-track">
            {visibleProducts.map((product) => (
              <div key={product.id} className="top-selling-card">
                <div className="card-inner">
                  {/* Badges */}
                  {product.tag && (
                    <span
                      className={`badge ${product.tag === "NEW" ? "badge-new" : "badge-sale"}`}
                    >
                      {product.tag}
                    </span>
                  )}

                  {/* Image */}
                  <div className="card-image">
                    <img src={product.img} alt={product.title} />
                    {/* Floating Buttons */}
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
                      <button className="action-btn" aria-label="Wishlist">
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

                  {/* Title */}
                  <h3 className="product-title">
                    <a href="#">{product.title}</a>
                  </h3>

                  {/* Rating */}
                  <div className="rating">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={
                          i < Math.floor(product.rating)
                            ? "star filled"
                            : "star"
                        }
                      >
                        ★
                      </span>
                    ))}
                  </div>

                  {/* Price */}
                  <div className="price-box">
                    <span className="current-price">
                      ${product.price.toFixed(2)}
                    </span>
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

          <button
            className={`nav-btn next ${startIndex >= maxIndex ? "disabled" : ""}`}
            onClick={nextSlide}
            disabled={startIndex >= maxIndex}
            aria-label="Next"
          >
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
    </section>
  );
};

export default TopSelling;
