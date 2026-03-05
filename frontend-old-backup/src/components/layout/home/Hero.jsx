import Sidebar from "../../common/Sidebar";

const Hero = () => {
  return (
    <div className="global_hero">
      <div className="container">
        <Sidebar />
        <main className="main_banner">
          <div className="content">
            <span className="badge">Weekend Discount</span>
            <h1>
              Gaming VR <span>Online Store</span>
            </h1>
            <p>
              Last call for up to <strong>50%</strong> off!
            </p>
            <button className="btn_shop">SHOP NOW</button>
          </div>
          <div className="pagination">
            <span></span>
            <span className="active"></span>
            <span></span>
          </div>
        </main>

        <section className="side_promos">
          <article className="promo_card">
            <span className="discount">
              Upto <strong>35%</strong> Off
            </span>
            <h2>Apple i Watch Series 9</h2>
            <button className="btn_link">Shop Now</button>
          </article>
          <article className="promo_card">
            <span className="discount">
              Upto <strong>50%</strong> Off
            </span>
            <h2>Ajhua CCTV Camera</h2>
            <button className="btn_link">Shop Now</button>
          </article>
        </section>
      </div>

      <footer className="features_bar">
        <div className="feature_item">
          <div className="icon"></div>
          <div>
            <h3>24/7 SUPPORT</h3>
            <p>Support every time</p>
          </div>
        </div>
        <div className="feature_item">
          <div className="icon"></div>
          <div>
            <h3>ACCEPT PAYMENT</h3>
            <p>Visa, Paypal, Master</p>
          </div>
        </div>
        <div className="feature_item">
          <div className="icon"></div>
          <div>
            <h3>SECURED PAYMENT</h3>
            <p>100% secured</p>
          </div>
        </div>
        <div className="feature_item">
          <div className="icon"></div>
          <div>
            <h3>FREE SHIPPING</h3>
            <p>Order over $100</p>
          </div>
        </div>
        <div className="feature_item">
          <div className="icon"></div>
          <div>
            <h3>30 DAYS RETURN</h3>
            <p>30 days guaranteess</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Hero;
