import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { supabase } from "../../../lib/supabaseClient";
import { useTranslation } from "react-i18next";

const ProfileInfo = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.user_metadata?.first_name || "",
        last_name: user.user_metadata?.last_name || "",
        email: user.email || "",
        phone: user.user_metadata?.phone || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
        },
      });

      if (error) throw error;
      setMessage({
        type: "success",
        text: t("dashboard.profile.success_update"),
      });
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="account-content">
      <div className="section-header">
        <h2>{t("dashboard.profile.title")}</h2>
        <p>{t("dashboard.profile.description")}</p>
      </div>

      {message && (
        <div
          style={{
            padding: "10px 15px",
            borderRadius: "6px",
            marginBottom: "20px",
            backgroundColor: message.type === "success" ? "#e8f5e9" : "#ffebee",
            color: message.type === "success" ? "#2e7d32" : "#c62828",
            border: `1px solid ${message.type === "success" ? "#a5d6a7" : "#ef9a9a"}`,
          }}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-grid">
          <div className="form-group">
            <label>{t("auth.first_name_label")}</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>{t("auth.last_name_label")}</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>{t("auth.email_label")}</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              disabled
              title={t("dashboard.profile.email_no_change")}
            />
          </div>
          <div className="form-group">
            <label>{t("dashboard.profile.phone_label")}</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 234 567 8900"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="save-btn" disabled={loading}>
            {loading
              ? t("dashboard.profile.saving")
              : t("dashboard.profile.save_changes")}
          </button>
          <button type="button" className="cancel-btn">
            {t("dashboard.profile.cancel")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileInfo;
