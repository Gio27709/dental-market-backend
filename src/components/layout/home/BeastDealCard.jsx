import React from "react";

const BeastDealCard = () => {
  // Placeholder data - replace with props later if needed
  return (
    <div className="beast-deal-card">
      <div className="deal-header">
        <div className="deal-badge">Beast Deal</div>
        <div className="deal-timer">
          <span>Ends in: </span>
          <span className="time">10:25:00</span>
        </div>
      </div>
      <div className="deal-image">
        {/* Placeholder Image */}
        <img
          src="https://via.placeholder.com/400x500?text=Beast+Deal"
          alt="Featured Product"
        />
        <div className="hover-overlay"></div>
      </div>
      <div className="deal-content">
        <h3 className="product-title">Game Console Controller</h3>
        <div className="product-rating">
          ★★★★★ <span className="count">(52)</span>
        </div>
        <div className="product-price">
          <span className="current">$99.00</span>
          <span className="old">$129.00</span>
        </div>
        <p className="product-desc">
          Experience the ultimate gaming control with precision and comfort.
        </p>
        <button className="add-to-cart-btn">Add to Cart</button>
      </div>
    </div>
  );
};

export default BeastDealCard;
