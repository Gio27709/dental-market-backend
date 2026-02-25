import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";

const UsersManager = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("id, role, status, first_name, last_name, created_at, email:id") // email is tricky with Supabase auth vs profiles, usually auth.users is distinct. Assuming we only have profile data here.
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch emails from auth via RPC if needed, or just display IDs for now.
      // In a real app, we'd sync emails to profiles or use an edge function.
      setUsers(data || []);
    } catch (err) {
      console.error("Error fetching users:", err);
      alert("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      setUpdating(userId);
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId);

      if (error) throw error;

      // Update local state
      setUsers(
        users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
      );
    } catch (err) {
      console.error("Error updating role:", err);
      alert("Failed to update role");
    } finally {
      setUpdating(null);
    }
  };

  const allowedRolesToAssign = () => {
    // Owner can assign anything, especially admin
    if (user?.role === "owner")
      return ["owner", "admin", "dental", "dentist", "buyer"];
    // Admin can assign lower tier roles
    if (user?.role === "admin") return ["dental", "dentist", "buyer"];
    return [];
  };

  const availableRoles = allowedRolesToAssign();

  return (
    <div className="admin-users-manager">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <h1 style={{ color: "#333" }}>User Management</h1>
        <button
          onClick={fetchUsers}
          style={{
            padding: "0.5rem 1rem",
            background: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Refresh
        </button>
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          overflow: "hidden",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
          }}
        >
          <thead
            style={{
              backgroundColor: "#f8f9fa",
              borderBottom: "2px solid #eee",
            }}
          >
            <tr>
              <th style={{ padding: "1rem", color: "#555" }}>User / ID</th>
              <th style={{ padding: "1rem", color: "#555" }}>Current Role</th>
              <th style={{ padding: "1rem", color: "#555" }}>Status</th>
              <th style={{ padding: "1rem", color: "#555" }}>Joined</th>
              <th
                style={{ padding: "1rem", color: "#555", textAlign: "center" }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="5"
                  style={{ padding: "2rem", textAlign: "center" }}
                >
                  Loading users...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  style={{ padding: "2rem", textAlign: "center" }}
                >
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "1rem" }}>
                    <div style={{ fontWeight: "600", color: "#333" }}>
                      {u.first_name
                        ? `${u.first_name} ${u.last_name || ""}`
                        : "No Name"}
                    </div>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "#888",
                        wordBreak: "break-all",
                      }}
                    >
                      {u.id}
                    </div>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "0.3rem 0.6rem",
                        borderRadius: "4px",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                        textTransform: "uppercase",
                        backgroundColor:
                          u.role === "owner"
                            ? "#e91e63"
                            : u.role === "admin"
                              ? "#007bff"
                              : "#e0e0e0",
                        color:
                          u.role === "owner" || u.role === "admin"
                            ? "#fff"
                            : "#333",
                      }}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <span
                      style={{
                        color: u.status === "active" ? "#28a745" : "#f39c12",
                      }}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td style={{ padding: "1rem", color: "#777" }}>
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "1rem", textAlign: "center" }}>
                    {/* Role Selector: Only show if current user has permission to edit this user's role */}
                    {user?.role === "owner" ||
                    (user?.role === "admin" &&
                      u.role !== "owner" &&
                      u.role !== "admin") ? (
                      <select
                        value={u.role}
                        onChange={(e) => handleChangeRole(u.id, e.target.value)}
                        disabled={updating === u.id}
                        style={{
                          padding: "0.4rem",
                          borderRadius: "4px",
                          border: "1px solid #ccc",
                          outline: "none",
                        }}
                      >
                        {availableRoles.map((role) => (
                          <option key={role} value={role}>
                            {role.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span style={{ color: "#aaa", fontSize: "0.85rem" }}>
                        No Permission
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersManager;
