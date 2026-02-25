import React from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

const AdminLayout = () => {
  return (
    <div
      className="admin-layout"
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#f4f6f9",
      }}
    >
      <AdminSidebar />
      <div
        className="admin-main-content"
        style={{ flex: 1, display: "flex", flexDirection: "column" }}
      >
        <AdminHeader />
        <main style={{ padding: "2rem", flex: 1, overflowY: "auto" }}>
          <Outlet /> {/* Renders the nested admin pages */}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
