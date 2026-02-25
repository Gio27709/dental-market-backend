import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { Home, Users, Store, Settings, LogOut } from "lucide-react";

const AdminSidebar = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <aside
      className="admin-sidebar"
      style={{
        width: "260px",
        backgroundColor: "#1e1e2d",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "sticky",
        top: 0,
      }}
    >
      <div
        className="admin-brand"
        style={{
          padding: "2rem 1.5rem",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            margin: 0,
            letterSpacing: "1px",
          }}
        >
          OCLUXX{" "}
          <span style={{ color: "#007bff", fontSize: "1rem" }}>Admin</span>
        </h2>
      </div>

      <nav className="admin-nav" style={{ flex: 1, padding: "1.5rem 0" }}>
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          <li>
            <NavLink
              to="/admin"
              end
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                padding: "0.8rem 1.5rem",
                textDecoration: "none",
                color: isActive ? "#fff" : "#a2a3b7",
                backgroundColor: isActive
                  ? "rgba(255,255,255,0.05)"
                  : "transparent",
                borderLeft: isActive
                  ? "3px solid #007bff"
                  : "3px solid transparent",
                transition: "all 0.2s",
              })}
            >
              <Home size={20} />
              <span>Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/users"
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                padding: "0.8rem 1.5rem",
                textDecoration: "none",
                color: isActive ? "#fff" : "#a2a3b7",
                backgroundColor: isActive
                  ? "rgba(255,255,255,0.05)"
                  : "transparent",
                borderLeft: isActive
                  ? "3px solid #007bff"
                  : "3px solid transparent",
                transition: "all 0.2s",
              })}
            >
              <Users size={20} />
              <span>User Roles</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/stores"
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                padding: "0.8rem 1.5rem",
                textDecoration: "none",
                color: isActive ? "#fff" : "#a2a3b7",
                backgroundColor: isActive
                  ? "rgba(255,255,255,0.05)"
                  : "transparent",
                borderLeft: isActive
                  ? "3px solid #007bff"
                  : "3px solid transparent",
                transition: "all 0.2s",
              })}
            >
              <Store size={20} />
              <span>Store Approvals</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/settings"
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                padding: "0.8rem 1.5rem",
                textDecoration: "none",
                color: isActive ? "#fff" : "#a2a3b7",
                backgroundColor: isActive
                  ? "rgba(255,255,255,0.05)"
                  : "transparent",
                borderLeft: isActive
                  ? "3px solid #007bff"
                  : "3px solid transparent",
                transition: "all 0.2s",
              })}
            >
              <Settings size={20} />
              <span>Settings</span>
            </NavLink>
          </li>
        </ul>
      </nav>

      <div
        className="admin-footer"
        style={{
          padding: "1.5rem",
          borderTop: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <button
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.8rem",
            background: "none",
            border: "none",
            color: "#ff4d4f",
            cursor: "pointer",
            width: "100%",
            fontSize: "1rem",
            padding: "0.5rem 0",
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => (e.target.style.opacity = "0.8")}
          onMouseLeave={(e) => (e.target.style.opacity = "1")}
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
