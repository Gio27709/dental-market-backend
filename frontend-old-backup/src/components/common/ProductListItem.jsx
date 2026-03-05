import React from "react";

const ProductListItem = ({ image, title, price, oldPrice, rating }) => {
  return (
    <div className="product-list-item">
      <div className="item-image">
        <img src={image} alt={title} />
      </div>
      <div className="item-details">
        <h4 className="item-title">
          <a href="#">{title}</a>
        </h4>
        <div className="item-rating">
          {[...Array(5)].map((_, i) => (
            <span key={i} className={`star ${i < rating ? "filled" : ""}`}>
              ★
            </span>
          ))}
        </div>
        <div className="item-price">
          <span className="current-price">${price}</span>
          {oldPrice && <span className="old-price">${oldPrice}</span>}
        </div>
      </div>
    </div>
  );
};

export default ProductListItem;
