import React from "react";
import "../../../styles/layout/_promo-banners.scss";

// Placeholder data - replace with real images later or pass as props
const banners = [
  {
    id: 1,
    title: "New Line VR",
    subtitle: "Headset for Smartphone",
    color: "#8c7ae6", // Example purple
    image: "https://via.placeholder.com/300x200?text=VR+Headset", // Placeholder
    link: "#",
    gridArea: "banner1",
  },
  {
    id: 2,
    title: "Play Station 5",
    subtitle: "Dual Sense Controller",
    color: "#0984e3", // Example blue
    image: "https://via.placeholder.com/300x200?text=PS5+Controller", // Placeholder
    link: "#",
    gridArea: "banner2",
  },
  {
    id: 3,
    title: "Bose QuietComfort",
    subtitle: "Noise Cancelling",
    color: "#00b894", // Example green/teal
    image: "https://via.placeholder.com/300x200?text=Headphones", // Placeholder
    link: "#",
    gridArea: "banner3",
  },
];

const PromoBanners = () => {
  return (
    <section className="promo-banners-section">
      <div className="container">
        <div className="banners-grid">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className={`banner-item ${banner.gridArea}`}
              style={{ backgroundColor: banner.color }}
            >
              <div className="banner-content">
                <span className="subtitle">{banner.subtitle}</span>
                <h3 className="title">{banner.title}</h3>
                <a href={banner.link} className="shop-link">
                  Shop Now
                </a>
              </div>
              <div className="banner-image">
                <img src={banner.image} alt={banner.title} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PromoBanners;
