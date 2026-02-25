import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../../common/ProductCard";
import { useProducts } from "../../../hooks/useProducts";
import { productService } from "../../../services/productService";

const TopCategories = () => {
  const [activeTab, setActiveTab] = useState("smartphones"); // Default to existing category slug
  const [categories, setCategories] = useState([]);

  // Fetch products based on active tab
  const { products, loading } = useProducts({
    category: activeTab,
    limit: 10,
  });

  const scrollContainer = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Load categories dynamically
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await productService.getCategories();
        if (data && data.length > 0) {
          setCategories(data);
          setActiveTab(data[0].slug); // Set first category as active
        }
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };
    loadCategories();
  }, []);

  // Update scroll buttons visibility
  const checkScroll = () => {
    if (scrollContainer.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainer.current;
      setCanScrollLeft(scrollLeft > 2);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 2);
    }
  };

  useEffect(() => {
    const container = scrollContainer.current;
    if (container) {
      container.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);
      // Check after data loads
      setTimeout(checkScroll, 500);
    }
    return () => {
      if (container) {
        container.removeEventListener("scroll", checkScroll);
      }
      window.removeEventListener("resize", checkScroll);
    };
  }, [products]); // Re-check when products change

  const scrollRight = () => {
    if (scrollContainer.current) {
      const firstCard = scrollContainer.current.firstElementChild;
      const scrollAmount = firstCard ? firstCard.offsetWidth + 24 : 300;
      scrollContainer.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const scrollLeft = () => {
    if (scrollContainer.current) {
      const firstCard = scrollContainer.current.firstElementChild;
      const scrollAmount = firstCard ? firstCard.offsetWidth + 24 : 300;
      scrollContainer.current.scrollBy({
        left: -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="top-categories-section">
      <div className="container">
        <div className="section-header">
          <div className="title-area">
            <h2>Top Categories in Sales and Trending</h2>
            <p>Discover the best products from our top collections.</p>
          </div>

          <div className="tabs-area">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`tab-btn ${activeTab === cat.slug ? "active" : ""}`}
                onClick={() => setActiveTab(cat.slug)}
              >
                {/* Fallback icon or use image if available */}
                <span className="label">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="slider-container">
          {canScrollLeft && (
            <button
              className="slider-arrow prev"
              onClick={scrollLeft}
              aria-label="Previous"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5 8.25 12l7.5-7.5"
                />
              </svg>
            </button>
          )}

          <div className="products-grid" ref={scrollContainer}>
            {loading ? (
              // Simple loading skeleton
              [...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="product-item skeleton"
                  style={{
                    height: "400px",
                    background: "#f0f0f0",
                    borderRadius: "12px",
                  }}
                ></div>
              ))
            ) : products.length > 0 ? (
              products.map((product) => (
                <div key={product.id} className="product-item">
                  <ProductCard
                    id={product.id}
                    title={product.title}
                    slug={product.slug}
                    price={product.price_usd || product.price} // Depending on new vs old schema
                    salePrice={product.sale_price}
                    image={product.images?.[0]}
                    rating={product.rating}
                    isNew={product.is_new}
                    isFeatured={product.is_featured}
                  />
                </div>
              ))
            ) : (
              <div className="no-products">
                No products found in this category.
              </div>
            )}
          </div>

          {canScrollRight && (
            <button
              className="slider-arrow next"
              onClick={scrollRight}
              aria-label="Next"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m8.25 4.5 7.5 7.5-7.5 7.5"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default TopCategories;
