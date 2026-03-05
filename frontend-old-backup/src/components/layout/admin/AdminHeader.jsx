import React from "react";
import { useAuth } from "../../../context/AuthContext";
import { Link } from "react-router-dom";

const AdminHeader = () => {
  const { user } = useAuth();

  return (
    <header
      className="admin-header"
      style={{
        height: "70px",
        backgroundColor: "#fff",
        borderBottom: "1px solid #eee",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 2rem",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <div className="search-bar">
        {/* Placeholder for global admin search */}
      </div>

      <div
        className="user-profile"
        style={{ display: "flex", alignItems: "center", gap: "1rem" }}
      >
        <Link
          to="/"
          style={{
            color: "#007bff",
            textDecoration: "none",
            fontSize: "0.9rem",
            marginRight: "1rem",
          }}
        >
          Back to Store
        </Link>
        <div style={{ textAlign: "right" }}>
          <p
            style={{
              margin: 0,
              fontWeight: "600",
              fontSize: "0.95rem",
              color: "#333",
            }}
          >
            {user?.firstName
              ? `${user.firstName} ${user.lastName || ""}`
              : user?.email}
          </p>
          <span
            style={{
              fontSize: "0.75rem",
              color: "#fff",
              backgroundColor: user?.role === "owner" ? "#e91e63" : "#007bff",
              padding: "0.1rem 0.5rem",
              borderRadius: "12px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            {user?.role}
          </span>
        </div>
        <div
          className="avatar"
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            backgroundColor: "#eee",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            color: "#888",
          }}
        >
          {user?.firstName
            ? user.firstName[0].toUpperCase()
            : user?.email?.[0].toUpperCase()}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
