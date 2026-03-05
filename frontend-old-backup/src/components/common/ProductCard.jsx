import React from "react";
import { Link } from "react-router-dom";
import { useExchangeRate } from "../../hooks/useProducts";
import { useCart } from "../../context/CartContext";
// Styles are handled globally via main.scss importing the partial

const ProductCard = ({
  id,
  image,
  title,
  slug,
  price,
  salePrice,
  rating = 5,
  isNew,
  badge,
  badgeColor = "red",
}) => {
  const { formatPrice } = useExchangeRate();
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    // Reconstruct product object. The database hook needs a valid UUID id.
    // If id is missing in mock data, it might fail Supabase insertion.
    addToCart({
      id,
      title,
      price_usd: salePrice || price,
      images: [image],
    });
  };

  return (
    <div className="product-card">
      <div className="card-media">
        {salePrice && <span className="badge badge-red">SALE</span>}
        {isNew && !salePrice && <span className="badge badge-blue">NEW</span>}
        {/* Fallback for manual props */}
        {badge && !salePrice && !isNew && (
          <span
            className={`badge ${badgeColor === "blue" ? "badge-blue" : "badge-red"}`}
          >
            {badge}
          </span>
        )}

        <div className="image-wrapper">
          <Link to={`/product/${slug || id}`}>
            <img
              src={
                image ||
                "https://placehold.co/400x400/f3f4f6/6b7280?text=No+Image"
              }
              alt={title || "Product Image"}
              onError={(e) => {
                e.target.src =
                  "https://placehold.co/400x400/f3f4f6/6b7280?text=No+Image";
              }}
            />
          </Link>
        </div>

        {/* Action Buttons Overlay */}
        <div className="action-buttons">
          <button
            className="action-btn"
            aria-label="Add to Cart"
            onClick={handleAddToCart}
          >
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

      <div className="card-content">
        <h3 className="product-title">
          <Link to={`/product/${slug || id}`}>{title}</Link>
        </h3>

        <div className="rating">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill={i < rating ? "currentColor" : "none"}
              stroke="currentColor"
              className="star"
            >
              <path
                fillRule="evenodd"
                d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                clipRule="evenodd"
              />
            </svg>
          ))}
        </div>

        <div className="price-box">
          {salePrice ? (
            <>
              <span className="current-price">{formatPrice(salePrice)}</span>
              <span className="old-price">{formatPrice(price)}</span>
            </>
          ) : (
            <span className="current-price">{formatPrice(price)}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
