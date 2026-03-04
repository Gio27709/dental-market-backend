import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { getMyOrders } from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function Account() {
  const { user, logout } = useAuth();
  const { wipeLocalCartOnly } = useCart();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchOrders = async () => {
      // Don't fetch if user is already logged out or logging out
      if (!user) return;

      try {
        // Double check session hasn't been destroyed in the split second since render
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) return; // Silent abort if no token

        const response = await getMyOrders({ signal: controller.signal });
        if (isMounted) {
          setOrders(response.data.data || response.data);
        }
      } catch (err) {
        if (err.name === "CanceledError" || err.message === "canceled") return;
        if (isMounted) {
          setError(err.response?.data?.error || "Error al cargar pedidos");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchOrders();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow rounded-lg overflow-hidden mb-8 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Mi Perfil</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{user.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Rol</p>
            <p className="font-medium capitalize">{user.role}</p>
          </div>
        </div>
        <div className="mt-6">
          <button
            onClick={async () => {
              await logout();
              wipeLocalCartOnly();
              localStorage.removeItem("dental_market_cart");
              navigate("/login");
            }}
            className="text-red-600 hover:text-red-800 font-medium"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Mis Pedidos</h2>
        {loading ? (
          <p className="text-gray-500">Cargando pedidos...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : orders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              Aún no has realizado ninguna compra.
            </p>
            <Link
              to="/"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Explorar productos
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
                  <div>
                    <p className="text-sm text-gray-500">
                      Pedido #{order.id.split("-")[0]}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary-600">
                      ${order.total_usd.toFixed(2)}
                    </p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                      {order.order_status}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.quantity}x {item.products?.name || "Producto"}
                      </span>
                      <span className="font-medium text-gray-900">
                        ${(item.price_at_purchase * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
