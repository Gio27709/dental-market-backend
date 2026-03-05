import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import AccountSidebar from "../components/layout/account/AccountSidebar";
import ProfileInfo from "../components/layout/account/ProfileInfo";
import Header from "../components/layout/Header";
import "../styles/pages/_account.scss";

const Account = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  if (loading || !user) {
    return (
      <div
        className="loading-screen"
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p>Loading account...</p>
      </div>
    );
  }

  return (
    <div className="account-page">
      <Header />
      <div className="container" style={{ marginTop: "2rem" }}>
        <div className="account-layout">
          <AccountSidebar onLogout={handleLogout} />
          <ProfileInfo />
        </div>
      </div>
    </div>
  );
};

export default Account;
