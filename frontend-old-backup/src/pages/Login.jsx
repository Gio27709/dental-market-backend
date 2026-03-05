import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import "../styles/pages/_login.scss";
import { useTranslation } from "react-i18next";

const Login = () => {
  const { user, signIn, signInWithGoogle } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate("/account", { replace: true });
    }
  }, [user, loading, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error } = await signIn({ email, password });
      if (error) throw error;
      navigate("/"); // Redirect to home on success
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-split-screen">
        {/* Left Column: Image/Branding */}
        <div className="login-brand-section">
          <div className="brand-overlay">
            <h1>Welcome Back</h1>
            <p>
              Access your premium dashboard and manage your products with style.
            </p>
          </div>
          <img
            src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
            alt="Office Tech"
            className="brand-image"
          />
        </div>

        {/* Right Column: Login Form */}
        <div className="login-form-section">
          <div className="login-container">
            <div className="login-header">
              <h2 className="login-title">{t("auth.sign_in_title")}</h2>
              <p className="login-subtitle">
                Please enter your details to sign in.
              </p>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button onClick={handleGoogleLogin} className="google-btn">
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google logo"
              />
              <span>{t("auth.google_sign_in")}</span>
            </button>

            <div className="divider">
              <span>OR</span>
            </div>

            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group">
                <label>{t("auth.email_label")}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@company.com"
                />
              </div>
              <div className="form-group">
                <label>{t("auth.password_label")}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
              </div>

              <div className="form-actions">
                <div className="remember-me">
                  <input type="checkbox" id="remember" />
                  <label htmlFor="remember">Remember me</label>
                </div>
                <a href="#" className="forgot-password">
                  {t("auth.forgot_pass")}
                </a>
              </div>

              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? "Signing In..." : t("auth.sign_in_btn")}
              </button>
            </form>

            <p className="register-link">
              {t("auth.no_account")}{" "}
              <Link to="/register">{t("auth.create_one")}</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
