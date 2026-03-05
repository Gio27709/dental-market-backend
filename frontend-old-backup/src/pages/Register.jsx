import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import "../styles/pages/_register.scss";
import { useTranslation } from "react-i18next";

const Register = () => {
  const { signUp } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [passwordValidations, setPasswordValidations] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false,
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [showPasswordRequirements, setShowPasswordRequirements] =
    useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "password") {
      validatePassword(value);
      setShowPasswordRequirements(true);
    }
  };

  const validatePassword = (pass) => {
    setPasswordValidations({
      length: pass.length >= 8 && pass.length <= 16,
      upper: /[A-Z]/.test(pass),
      lower: /[a-z]/.test(pass),
      number: /[0-9]/.test(pass),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pass),
    });
  };

  const isPasswordValid = Object.values(passwordValidations).every(Boolean);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      return setError(t("auth.pass_mismatch"));
    }

    if (!isPasswordValid) {
      return setError(t("auth.pass_requirements"));
    }

    setLoading(true);
    try {
      const { data, error } = await signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
          },
        },
      });

      if (error) throw error;

      if (data?.user && !data?.session) {
        setMessage({
          type: "success",
          text: t("auth.reg_success"),
        });
        // Optional: clear form or redirect to a specific "verify email" page
        return;
      }

      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-split-screen">
        {/* Left Column: Image/Branding */}
        <div className="register-brand-section">
          <div className="brand-overlay">
            <h1>Join the Future</h1>
            <p>
              Create an account to unlock exclusive deals and premium products.
            </p>
          </div>
          <img
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
            alt="Modern Office"
            className="brand-image"
          />
        </div>

        {/* Right Column: Form */}
        <div className="register-form-section">
          <div className="register-container">
            <h2 className="register-title">{t("auth.create_account_title")}</h2>
            <p className="register-subtitle">{t("auth.join_us_subtitle")}</p>

            {error && <div className="error-message">{error}</div>}
            {message && (
              <div
                className="success-message"
                style={{
                  backgroundColor: "#e8f5e9",
                  color: "#2e7d32",
                  padding: "12px",
                  borderRadius: "6px",
                  marginBottom: "1.5rem",
                  fontSize: "0.9rem",
                  textAlign: "center",
                  border: "1px solid #a5d6a7",
                }}
              >
                {message.text}
              </div>
            )}

            <form onSubmit={handleRegister} className="register-form">
              <div className="form-row">
                <div className="form-group">
                  <label>{t("auth.first_name_label")}</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    placeholder="John"
                  />
                </div>
                <div className="form-group">
                  <label>{t("auth.last_name_label")}</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>{t("auth.email_label")}</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="john.doe@example.com"
                />
              </div>

              <div className="form-group">
                <label>{t("auth.password_label")}</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setShowPasswordRequirements(true)}
                  required
                  placeholder={t("auth.password_label")}
                />
                {showPasswordRequirements && (
                  <div className="password-requirements">
                    <p className={passwordValidations.length ? "valid" : ""}>
                      • 8-16 Characters
                    </p>
                    <p className={passwordValidations.upper ? "valid" : ""}>
                      • Uppercase Letter
                    </p>
                    <p className={passwordValidations.lower ? "valid" : ""}>
                      • Lowercase Letter
                    </p>
                    <p className={passwordValidations.number ? "valid" : ""}>
                      • Number
                    </p>
                    <p className={passwordValidations.special ? "valid" : ""}>
                      • Special Character
                    </p>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>{t("auth.confirm_password_label")}</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder={t("auth.confirm_password_label")}
                />
              </div>

              <button
                type="submit"
                className="register-btn"
                disabled={loading || !isPasswordValid}
              >
                {loading ? "Creating Account..." : t("auth.register_btn")}
              </button>
            </form>

            <p className="login-link">
              {t("auth.have_account")}{" "}
              <Link to="/login">{t("auth.sign_in_btn")}</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
