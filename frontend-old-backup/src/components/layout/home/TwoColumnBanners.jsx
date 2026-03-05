import React from "react";
import "../../../styles/layout/_two-column-banners.scss";

// Mock Data
const BANNERS = [
  {
    id: 1,
    subtitle: "Weekend Discount",
    title: "Watch and AirPod Up To 50% Off",
    linkText: "Shop Now",
    img: "https://via.placeholder.com/250x200?text=Speakers", // Replace with relevant image
    bgColor: "#f4f4f4", // Light grey
    darkText: true,
  },
  {
    id: 2,
    subtitle: "New Arrival",
    title: "Sony Headphone & Wireless Speaker",
    linkText: "Shop Now",
    img: "https://via.placeholder.com/250x200?text=Watches", // Replace with relevant image
    bgColor: "#f4f4f4",
    darkText: true,
  },
];

const TwoColumnBanners = () => {
  return (
    <section className="two-column-banners-section">
      <div className="container mx-auto">
        <div className="banners-grid">
          {BANNERS.map((banner) => (
            <div
              key={banner.id}
              className="promo-banner-card"
              style={{ backgroundColor: banner.bgColor }}
            >
              <div className="banner-content">
                <span className="subtitle">{banner.subtitle}</span>
                <h3 className="title">{banner.title}</h3>
                <a href="#" className="shop-link">
                  {banner.linkText} <span className="arrow">→</span>
                </a>
              </div>
              <div className="banner-image">
                <img src={banner.img} alt={banner.title} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TwoColumnBanners;
