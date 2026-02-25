import React from "react";
import { useAuth } from "../../context/AuthContext";

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="admin-dashboard">
      <h1 style={{ marginBottom: "0.5rem", color: "#333" }}>
        Dashboard Overview
      </h1>
      <p style={{ color: "#777", marginBottom: "2rem" }}>
        Welcome back, {user?.firstName || "Admin"}!
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        {/* Metric Cards placeholders */}
        <div
          style={{
            background: "#fff",
            padding: "1.5rem",
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
            borderLeft: "4px solid #007bff",
          }}
        >
          <h3
            style={{
              fontSize: "0.9rem",
              color: "#777",
              textTransform: "uppercase",
              marginBottom: "0.5rem",
            }}
          >
            Total Users
          </h3>
          <p
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              margin: 0,
              color: "#333",
            }}
          >
            1,245
          </p>
        </div>

        <div
          style={{
            background: "#fff",
            padding: "1.5rem",
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
            borderLeft: "4px solid #28a745",
          }}
        >
          <h3
            style={{
              fontSize: "0.9rem",
              color: "#777",
              textTransform: "uppercase",
              marginBottom: "0.5rem",
            }}
          >
            Active Stores
          </h3>
          <p
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              margin: 0,
              color: "#333",
            }}
          >
            48
          </p>
        </div>

        <div
          style={{
            background: "#fff",
            padding: "1.5rem",
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
            borderLeft: "4px solid #f39c12",
          }}
        >
          <h3
            style={{
              fontSize: "0.9rem",
              color: "#777",
              textTransform: "uppercase",
              marginBottom: "0.5rem",
            }}
          >
            Pending Approvals
          </h3>
          <p
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              margin: 0,
              color: "#333",
            }}
          >
            12
          </p>
        </div>

        <div
          style={{
            background: "#fff",
            padding: "1.5rem",
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
            borderLeft: "4px solid #e91e63",
          }}
        >
          <h3
            style={{
              fontSize: "0.9rem",
              color: "#777",
              textTransform: "uppercase",
              marginBottom: "0.5rem",
            }}
          >
            Total Revenue
          </h3>
          <p
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              margin: 0,
              color: "#333",
            }}
          >
            $45,230
          </p>
        </div>
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          padding: "1.5rem",
        }}
      >
        <h2
          style={{
            fontSize: "1.2rem",
            marginBottom: "1rem",
            color: "#333",
            borderBottom: "1px solid #eee",
            paddingBottom: "1rem",
          }}
        >
          Recent Activity
        </h2>
        <p style={{ color: "#777" }}>
          Select "User Roles" or "Store Approvals" from the sidebar to manage
          the platform.
        </p>
        {/* Placeholder for activity feed */}
      </div>
    </div>
  );
};

export default AdminDashboard;
