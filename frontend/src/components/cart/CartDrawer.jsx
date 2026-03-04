import PropTypes from "prop-types";
import { useEffect } from "react";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import CartItem from "./CartItem";
import { formatCurrencyUSD, formatCurrencyVES } from "../../utils/formatters";

export default function CartDrawer({ isOpen, onClose }) {
  const { items, total_usd, total_ves, updateQuantity, removeFromCart } =
    useCart();
  const navigate = useNavigate();

  // Handle body scroll locking
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCheckoutDraft = () => {
    onClose();
    navigate("/cart");
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full md:w-[400px] bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out border-l border-gray-200 animate-slide-in-right">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Tu Carrito</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gray-50/50">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-16 h-16 mb-4 opacity-50 text-gray-300"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                Tu carrito está vacío
              </h3>
              <p className="text-sm">
                Agrega productos para iniciar tu compra.
              </p>
              <button
                onClick={onClose}
                className="mt-6 px-6 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Seguir buscando
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-md overflow-hidden border border-gray-100 shadow-sm"
                >
                  <CartItem
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeFromCart}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer actions */}
        {items.length > 0 && (
          <div className="p-6 border-t border-gray-100 bg-white">
            <div className="flex justify-between items-end mb-4">
              <span className="text-gray-500 font-medium">Subtotal</span>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900 leading-none">
                  {formatCurrencyUSD(total_usd)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {formatCurrencyVES(total_ves)} VES
                </p>
              </div>
            </div>

            <button
              onClick={handleCheckoutDraft}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3.5 px-4 rounded-lg font-semibold transition-colors shadow-sm"
            >
              Ver Carrito Completo
            </button>
          </div>
        )}
      </div>
    </>
  );
}

CartDrawer.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
