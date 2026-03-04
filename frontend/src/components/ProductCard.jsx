import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import PriceDisplay from "./products/PriceDisplay";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    // Add with default variation if exists, or null
    addToCart(product, product.variations?.[0] || null, 1);
    toast.success("Agregado a la bolsa");
  };

  const handleFavorite = () => {
    console.log("Toggling favorite: ", product.id);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full group">
      {/* Image Container */}
      <div className="relative h-48 bg-gray-50 w-full overflow-hidden flex items-center justify-center">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <span className="text-gray-400 text-sm">Sin Imagen</span>
        )}

        {/* Favorite Button (floating) */}
        <button
          onClick={handleFavorite}
          className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-white rounded-full text-gray-400 hover:text-red-500 shadow-sm transition-colors z-10"
          title="Agregar a favoritos"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
            />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="mb-1 text-xs text-gray-400 uppercase tracking-wider font-semibold">
          {product.store?.business_name || "Tienda Oficial"}
        </div>

        <h3
          className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2"
          title={product.name}
        >
          {product.name}
        </h3>

        <div className="mt-auto pt-4 flex items-end justify-between">
          <PriceDisplay amountUSD={product.price} />
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex gap-2">
          <Link
            to={`/product/${product.id}`}
            className="flex-1 text-center bg-gray-50 text-gray-700 border border-gray-200 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors text-sm font-medium"
          >
            Ver Detalles
          </Link>
          <button
            onClick={handleAddToCart}
            className="bg-primary-600 text-white px-3 py-2 rounded-md hover:bg-primary-700 transition-colors flex items-center justify-center shadow-sm"
            title="Agregar al carrito"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    images: PropTypes.arrayOf(PropTypes.string),
    store: PropTypes.shape({
      business_name: PropTypes.string,
    }),
    variations: PropTypes.array,
  }).isRequired,
};
