import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { productService } from "../services/productService";
import { useExchangeRate } from "../hooks/useProducts";
import ProductCard from "../components/common/ProductCard";
import "../styles/pages/_product-details.scss";

const ProductDetails = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");

  // Exchange rate hook
  const { formatPrice } = useExchangeRate();

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      try {
        const data = await productService.getProductBySlug(slug);
        setProduct(data);

        // Fetch related products (same category)
        if (data?.category_id) {
          const related = await productService.getProducts({
            category: data.categories.slug,
            limit: 4,
          });
          setRelatedProducts(related.filter((p) => p.id !== data.id));
        }
      } catch (err) {
        console.error("Error loading product:", err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) loadProduct();
  }, [slug]);

  if (loading) return <div className="loading-container">Loading...</div>;
  if (!product) return <div className="error-container">Product not found</div>;

  const images =
    product.images && product.images.length > 0
      ? product.images
      : ["https://via.placeholder.com/600x600?text=No+Image"];

  return (
    <div className="product-details-page">
      <div className="container">
        {/* Breadcrumb / Top Nav */}
        <div className="breadcrumb">
          <Link to="/">Home</Link> /<Link to="/shop">Shop</Link> /
          <span className="current">{product.title}</span>
        </div>

        <div className="product-main-content">
          {/* Left Column: Images */}
          <div className="product-gallery">
            <div className="thumbnail-list">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className={`thumb ${activeImage === idx ? "active" : ""}`}
                  onClick={() => setActiveImage(idx)}
                >
                  <img src={img} alt={`Thumbnail ${idx}`} />
                </div>
              ))}
            </div>
            <div className="main-image">
              <img src={images[activeImage]} alt={product.title} />
              {product.is_new && <span className="badge new">New</span>}
              {product.sale_price && <span className="badge sale">Sale</span>}
            </div>
          </div>

          {/* Right Column: Info */}
          <div className="product-info">
            <h1 className="product-title">{product.title}</h1>

            <div className="product-meta-top">
              <div className="rating">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`star ${i < Math.round(product.rating || 5) ? "filled" : ""}`}
                  >
                    ★
                  </span>
                ))}
                <span className="review-count">(3 reviews)</span>
              </div>
            </div>

            <div className="price-section">
              {product.sale_price ? (
                <>
                  <span className="current-price">
                    {formatPrice(product.sale_price)}
                  </span>
                  <span className="old-price">
                    {formatPrice(product.price)}
                  </span>
                </>
              ) : (
                <span className="current-price">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>

            <p className="description">
              {product.description ||
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."}
            </p>

            {/* Variants (Mocked for now as per design) */}
            <div className="variants">
              <div className="variant-row">
                <span className="label">Color</span>
                <div className="color-options">
                  <button
                    className="color-btn black selected"
                    title="Black"
                  ></button>
                  <button className="color-btn silver" title="Silver"></button>
                  <button className="color-btn blue" title="Blue"></button>
                </div>
              </div>

              <div className="variant-row">
                <span className="label">Storage</span>
                <div className="size-options">
                  <button className="size-btn selected">128GB</button>
                  <button className="size-btn">256GB</button>
                  <button className="size-btn">512GB</button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="actions-row">
              <div className="quantity-selector">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                  -
                </button>
                <input type="text" value={quantity} readOnly />
                <button onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>

              <button className="add-to-cart-btn">
                <span className="icon">🛍️</span> Add to Cart
              </button>

              <div className="extra-actions">
                <button className="icon-btn" title="Add to Wishlist">
                  ♡
                </button>
                <button className="icon-btn" title="Compare">
                  ⇄
                </button>
              </div>
            </div>

            <div className="social-share">
              <span>Share it:</span>
              <a href="#">IG</a> <a href="#">FB</a> <a href="#">TW</a>
            </div>

            <div className="product-meta-bottom">
              <p>
                <strong>Brand:</strong> {product.brands?.name || "Unknown"}
              </p>
              <p>
                <strong>Category:</strong>{" "}
                {product.categories?.name || "Uncategorized"}
              </p>
              <p>
                <strong>SKU:</strong> {product.sku || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="product-tabs">
          <div className="tabs-header">
            <button
              className={activeTab === "description" ? "active" : ""}
              onClick={() => setActiveTab("description")}
            >
              Description
            </button>
            <button
              className={activeTab === "reviews" ? "active" : ""}
              onClick={() => setActiveTab("reviews")}
            >
              Reviews (3)
            </button>
            <button
              className={activeTab === "qa" ? "active" : ""}
              onClick={() => setActiveTab("qa")}
            >
              Q & A
            </button>
          </div>

          <div className="tab-content">
            {activeTab === "description" && (
              <div className="description-content">
                <p>
                  {product.description ||
                    "More detailed description would go here..."}
                </p>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce
                  posuere metus vitae arcu imperdiet, id aliquet ante
                  scelerisque.
                </p>
              </div>
            )}
            {/* Other tabs placeholders */}
            {activeTab === "reviews" && <div>Reviews content...</div>}
            {activeTab === "qa" && <div>Q&A content...</div>}
          </div>
        </div>

        {/* Related Products */}
        <div className="related-products">
          <h2>Related Products</h2>
          <div className="products-grid">
            {relatedProducts.map((p) => (
              <div className="product-wrapper" key={p.id}>
                <ProductCard
                  title={p.title}
                  price={p.price}
                  salePrice={p.sale_price}
                  image={p.images?.[0]}
                  rating={p.rating}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
