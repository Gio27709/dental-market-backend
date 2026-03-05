import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import "../../styles/layout/_header.scss";

import { useTranslation } from "react-i18next";
import { useCart } from "../../context/CartContext";
import CartDrawer from "../cart/CartDrawer"; // We will create this
import brandLogo from "../../assets/logo.png";

const Header = () => {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const { cartCount, toggleDrawer } = useCart();
  const [langOpen, setLangOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setLangOpen(false);
  };
  const [currency, setCurrency] = useState("USD");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // If the click is NOT inside a dropdown-wrapper, close all dropdowns
      if (!event.target.closest(".dropdown-wrapper")) {
        setLangOpen(false);
        setCurrencyOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleLang = () => {
    setLangOpen(!langOpen);
    setCurrencyOpen(false);
  };

  const toggleCurrency = () => {
    setCurrencyOpen(!currencyOpen);
    setLangOpen(false);
  };

  const selectCurrency = (curr) => {
    setCurrency(curr);
    setCurrencyOpen(false);
  };

  return (
    <header className="global_header">
      {/* --- Top Bar --- */}
      <div className="header-top">
        <div className="container">
          <div className="top-left">
            <p>
              Free Shipping World wide for all orders over $199.{" "}
              <a href="#">Click and Shop Now.</a>
            </p>
          </div>
          <div className="top-right">
            <ul>
              <li>
                <a href="#">{t("header.order_tracking")}</a>
              </li>
              <li className="divider"></li>
              <li>
                <div className="dropdown-wrapper" onClick={toggleLang}>
                  <span>
                    {i18n.language === "es"
                      ? t("header.spanish")
                      : t("header.english")}
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className={`w-3 h-3 ${langOpen ? "rotate-180" : ""}`}
                    style={{ width: "12px", transition: "transform 0.2s" }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m19.5 8.25-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                  {langOpen && (
                    <ul className="dropdown-menu">
                      <li
                        onClick={(e) => {
                          e.stopPropagation();
                          changeLanguage("en");
                        }}
                      >
                        {t("header.english")}
                      </li>
                      <li
                        onClick={(e) => {
                          e.stopPropagation();
                          changeLanguage("es");
                        }}
                      >
                        {t("header.spanish")}
                      </li>
                    </ul>
                  )}
                </div>
              </li>
              <li className="divider"></li>
              <li>
                <div className="dropdown-wrapper" onClick={toggleCurrency}>
                  <span>{currency}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className={`w-3 h-3 ${currencyOpen ? "rotate-180" : ""}`}
                    style={{ width: "12px", transition: "transform 0.2s" }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m19.5 8.25-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                  {currencyOpen && (
                    <ul className="dropdown-menu">
                      <li
                        onClick={(e) => {
                          e.stopPropagation();
                          selectCurrency("USD");
                        }}
                      >
                        {t("header.usd")}
                      </li>
                      <li
                        onClick={(e) => {
                          e.stopPropagation();
                          selectCurrency("VES");
                        }}
                      >
                        VES
                      </li>
                    </ul>
                  )}
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* --- Middle Bar (Main) --- */}
      <div className="header-middle">
        <div className="container">
          {/* Mobile Hamburger */}
          <div
            className="mobile-hamburger"
            onClick={() => setSidebarOpen(true)}
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
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </div>

          {/* Logo */}
          <div className="logo">
            <Link to="/">
              <img src={brandLogo} alt="OCLUX Logo" className="brand-logo" />
            </Link>
          </div>

          {/* Search Bar */}
          {/* Search Bar */}
          <div className={`search-wrapper ${mobileSearchOpen ? "active" : ""}`}>
            <form onSubmit={(e) => e.preventDefault()}>
              <input type="text" placeholder={t("header.search_placeholder")} />
              <button type="submit" className="search-btn">
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
            </form>
          </div>

          {/* User Actions */}
          <div className="header-actions">
            {/* Mobile Search Trigger */}
            <div
              className="action-item mobile-search-trigger"
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            >
              <div className="icon-box">
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
              </div>
            </div>

            <div className="action-item">
              <Link to={user ? "/account" : "/login"} className="icon-box">
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
                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                  />
                </svg>
              </Link>
            </div>
            <div className="action-item">
              <div
                className="icon-box"
                onClick={toggleDrawer}
                style={{ cursor: "pointer" }}
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
                    d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                  />
                </svg>
                {cartCount > 0 && <span className="badge">{cartCount}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Bottom Bar (Nav) --- */}
      <div className="header-bottom">
        <div className="container">
          <div className="all-categories-btn">
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
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
            <span>{t("header.all_categories")}</span>
          </div>

          <nav className="main-nav">
            <ul>
              <li>
                <Link to="/">{t("header.home")}</Link>
              </li>
              <li>
                <Link to="#">
                  {t("header.shop")}
                  <svg
                    className="chevron"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m19.5 8.25-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </Link>
              </li>
              <li>
                <Link to="#">
                  {t("header.pages")}
                  <svg
                    className="chevron"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m19.5 8.25-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </Link>
              </li>
              <li>
                <Link to="#">Tablet</Link>
              </li>
              <li>
                <Link to="#">Games</Link>
              </li>
              <li>
                <Link to="#">{t("header.contact")}</Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      {/* --- Mobile Sidebar Overlay --- */}
      <div
        className={`mobile-sidebar-overlay ${sidebarOpen ? "open" : ""}`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      {/* --- Mobile Sidebar Drawer --- */}
      <aside className={`mobile-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="logo">
            <Link to="/" onClick={() => setSidebarOpen(false)}>
              <img src={brandLogo} alt="OCLUX Logo" className="brand-logo" />
            </Link>
          </div>
          <button className="close-btn" onClick={() => setSidebarOpen(false)}>
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
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li>
              <Link to="/" onClick={() => setSidebarOpen(false)}>
                {t("header.home")}
              </Link>
            </li>
            <li>
              <Link to="#" onClick={() => setSidebarOpen(false)}>
                DEMOS
                <svg
                  className="chevron"
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
              </Link>
            </li>
            <li>
              <Link to="#" onClick={() => setSidebarOpen(false)}>
                {t("header.shop")}
                <svg
                  className="chevron"
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
              </Link>
            </li>
            <li>
              <Link to="#" onClick={() => setSidebarOpen(false)}>
                {t("header.pages")}
                <svg
                  className="chevron"
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
              </Link>
            </li>
            <li>
              <Link to="#" onClick={() => setSidebarOpen(false)}>
                TABLET
              </Link>
            </li>
            <li>
              <Link to="#" onClick={() => setSidebarOpen(false)}>
                GAMES
              </Link>
            </li>
            <li>
              <Link to="#" onClick={() => setSidebarOpen(false)}>
                {t("header.contact")}
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
      {/* --- Cart Drawer --- */}
      <CartDrawer />
    </header>
  );
};

export default Header;
