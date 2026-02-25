import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

const safeLazy = (importFn) => {
  return lazy(async () => {
    try {
      return await importFn();
    } catch (error) {
      console.error("Error cargando el módulo en safeLazy:", error);
      // window.location.reload(); // Removed to prevent infinite refresh on error
      return {
        default: () => (
          <div style={{ padding: "2rem", color: "red" }}>
            Error loading module. Check console.
          </div>
        ),
      };
    }
  });
};

const Home = safeLazy(() => import("./pages/Home"));
const Login = safeLazy(() => import("./pages/Login"));
const Register = safeLazy(() => import("./pages/Register"));
const ProductDetails = safeLazy(() => import("./pages/ProductDetails"));
const Account = safeLazy(() => import("./pages/Account"));
const Cart = safeLazy(() => import("./pages/Cart"));

// Admin Imports
const ProtectedRoute = safeLazy(
  () => import("./components/common/ProtectedRoute"),
);
const AdminLayout = safeLazy(
  () => import("./components/layout/admin/AdminLayout"),
);
const AdminDashboard = safeLazy(() => import("./pages/admin/AdminDashboard"));
const UsersManager = safeLazy(() => import("./pages/admin/UsersManager"));
const StoresManager = safeLazy(() => import("./pages/admin/StoresManager"));

function App() {
  return (
    <Router>
      <div className="App">
        <Suspense
          fallback={
            <div className="loading-screen">
              <p>Is loading...</p>
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/product/:slug" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/account/*" element={<Account />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["owner", "admin"]}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<UsersManager />} />
              <Route path="stores" element={<StoresManager />} />
              <Route
                path="settings"
                element={<div>Admin Settings (Coming Soon)</div>}
              />
            </Route>
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;
