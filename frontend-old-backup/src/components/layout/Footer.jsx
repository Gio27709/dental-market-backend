import React from "react";
import "../../styles/layout/_footer.scss";

const Footer = () => {
  return (
    <footer className="site-footer">
      {/* Newsletter Section */}
      <div className="footer-newsletter">
        <div className="container mx-auto">
          <div className="newsletter-content">
            <div className="newsletter-text">
              <span className="icon">✉️</span> {/* Replace with SVG icon */}
              <h3 className="title">Sign Up For Newsletter</h3>
              <p className="subtitle">
                We’ll never share your email address with a third-party.
              </p>
            </div>

            <div className="newsletter-form">
              <div className="input-group">
                <input type="email" placeholder="Enter your email address..." />
                <button className="subscribe-btn">Subscribe</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="footer-main">
        <div className="container mx-auto">
          <div className="footer-grid">
            {/* Column 1: About */}
            <div className="footer-col">
              <h4 className="footer-heading">About Us</h4>
              <p className="footer-desc">
                We are a team of designers and developers that create high
                quality Magento, Prestashop, Opencart.
              </p>
              <ul className="contact-list">
                <li>
                  <strong>Address:</strong> 4710-4890 Breckinridge St, UK
                  Burlington, VT 05401
                </li>
                <li>
                  <strong>Email:</strong>{" "}
                  <a href="mailto:support@store.com">support@store.com</a>
                </li>
                <li>
                  <strong>Call Us:</strong> 1-1001-234-5678
                </li>
              </ul>
            </div>

            {/* Column 2: Information */}
            <div className="footer-col">
              <h4 className="footer-heading">Information</h4>
              <ul className="footer-links">
                <li>
                  <a href="#">Delivery Information</a>
                </li>
                <li>
                  <a href="#">Privacy Policy</a>
                </li>
                <li>
                  <a href="#">Terms & Conditions</a>
                </li>
                <li>
                  <a href="#">Contact Us</a>
                </li>
                <li>
                  <a href="#">Returns</a>
                </li>
              </ul>
            </div>

            {/* Column 3: My Account */}
            <div className="footer-col">
              <h4 className="footer-heading">My Account</h4>
              <ul className="footer-links">
                <li>
                  <a href="#">My Account</a>
                </li>
                <li>
                  <a href="#">Order History</a>
                </li>
                <li>
                  <a href="#">Wish List</a>
                </li>
                <li>
                  <a href="#">Newsletter</a>
                </li>
                <li>
                  <a href="#">Specials</a>
                </li>
              </ul>
            </div>

            {/* Column 4: App & Social */}
            <div className="footer-col">
              <h4 className="footer-heading">Download App</h4>
              <p className="footer-desc">Save $3 With App & New User only</p>
              <div className="app-buttons">
                {/* Placeholders for App Store buttons */}
                <div className="app-btn-group">
                  <div className="dummy-app-btn">App Store</div>
                  <div className="dummy-app-btn">Google Play</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="footer-bottom">
        <div className="container mx-auto">
          <div className="bottom-flex">
            <p className="copyright">
              © 2018 <span className="brand">Market</span>. All Rights Reserved.
            </p>
            <div className="payment-icons">
              {/* Placeholders for payment icons */}
              <span className="pay-icon">Visa</span>
              <span className="pay-icon">MasterCard</span>
              <span className="pay-icon">PayPal</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
