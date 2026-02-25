import React from "react";

const StoresManager = () => {
  return (
    <div className="admin-stores-manager">
      <h1 style={{ color: "#333", marginBottom: "2rem" }}>Store Approvals</h1>

      <div
        style={{
          background: "#fff",
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          padding: "3rem",
          textAlign: "center",
        }}
      >
        <h3 style={{ color: "#777", marginBottom: "1rem" }}>
          No pending stores
        </h3>
        <p style={{ color: "#aaa" }}>
          When a Dental/Vendor applies to create a store, they will appear here
          for your review.
        </p>
      </div>
    </div>
  );
};

export default StoresManager;
