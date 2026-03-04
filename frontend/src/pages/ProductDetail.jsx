import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProducts } from "../context/ProductContext";
import { useCart } from "../context/CartContext";
import ProductGallery from "../components/products/ProductGallery";
import ProductVariationSelector from "../components/products/ProductVariationSelector";
import PriceDisplay from "../components/products/PriceDisplay";
import toast from "react-hot-toast";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    fetchProductById,
    allProducts,
    loading: globalLoading,
  } = useProducts();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedVariationId, setSelectedVariationId] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    // Wait for the full catalog to be downloaded by context first
    if (globalLoading) return;

    const loadProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        // --- 🚀 CACHE CHECK ---
        // Buscamos si el producto ya fue descargado previamente en el catálogo base (Contexto)
        const cachedItem = allProducts.find((p) => p.id === id);
        if (cachedItem) {
          setProduct(cachedItem); // ¡Lo pintamos instantáneo en memoria!
          setLoading(false);
          return; // Detenemos la función y evitamos consumir el API en Render
        }
        // --- FIN CACHE CHECK ---

        // Si entra directo por URL o recarga la página, descargamos específicamente:
        const data = await fetchProductById(id);
        setProduct(data);
      } catch (err) {
        // Safe 404 Fallback: Render API does not have individual products route yet.
        // We seamlessly serve the product matching our locally fetched context list.
        if (err.response?.status === 404) {
          const localItem = allProducts.find((p) => p.id === id);
          if (localItem) {
            setProduct(localItem);
            return;
          }
        }
        setError(
          err.response?.data?.error ||
            err.message ||
            "No se pudo cargar el producto.",
        );
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id, fetchProductById, allProducts, globalLoading]);

  // Derived state to find currently selected variation object
  const hasVariations = product?.variations && product.variations.length > 0;

  const selectedVariation = hasVariations
    ? product.variations.find(
        (v) => String(v.id) === String(selectedVariationId),
      )
    : null;

  const currentStock = hasVariations
    ? selectedVariation
      ? selectedVariation.stock
      : 0
    : (product?.stock ?? 99); // Allow adding up to 99 if no strict stock exists

  const handleAddToCart = () => {
    if (hasVariations && !selectedVariation) {
      toast.error("Por favor selecciona una variación primero.");
      return;
    }

    // Add item using context provider and drawer trigger logic
    addToCart(product, selectedVariation, quantity);

    const variationText = selectedVariation
      ? `(${selectedVariation.attribute_value}) `
      : "";
    toast.success(
      `Agregado a la bolsa: ${product.name} ${variationText}- ${quantity} unid.`,
    );
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/2 aspect-square bg-gray-200 rounded-xl"></div>
          <div className="w-full md:w-1/2 space-y-4 py-4">
            <div className="h-4 bg-gray-200 w-1/4 rounded"></div>
            <div className="h-8 bg-gray-200 w-3/4 rounded"></div>
            <div className="h-24 bg-gray-200 w-full rounded"></div>
            <div className="h-10 bg-gray-200 w-1/3 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Producto no encontrado
        </h2>
        <p className="text-gray-500 mb-6">
          {error || "El artículo pudo haber sido eliminado."}
        </p>
        <button
          onClick={() => navigate("/")}
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          &larr; Volver al catálogo
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <button
        onClick={() => navigate("/")}
        className="text-sm text-gray-500 hover:text-gray-900 mb-6 flex items-center"
      >
        &larr; Catálogo
      </button>

      <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
        {/* Gallery */}
        <div className="w-full md:w-1/2">
          <ProductGallery images={product.images || []} />
        </div>

        {/* Info */}
        <div className="w-full md:w-1/2 flex flex-col">
          <div className="mb-2">
            <span className="text-xs font-semibold tracking-wider text-primary-600 uppercase bg-primary-50 px-2 py-1 rounded">
              {product.store?.business_name || "Tienda"}
            </span>
          </div>

          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
            {product.name}
          </h1>
          <div className="mb-6">
            <PriceDisplay amountUSD={product.price} />
          </div>

          <p className="text-gray-600 mb-8 whitespace-pre-line leading-relaxed">
            {product.description || "Descripción detallada no proporcionada."}
          </p>

          <div className="border-t border-gray-200 pt-6 mb-8">
            <ProductVariationSelector
              variations={product.variations}
              onChange={setSelectedVariationId}
            />

            <div className="mt-4 flex items-center gap-4">
              <label
                htmlFor="quantity"
                className="text-sm font-medium text-gray-700"
              >
                Cant.
              </label>
              <select
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                disabled={
                  (hasVariations && !selectedVariation) || currentStock <= 0
                }
                className="rounded-md border-gray-300 py-2 pl-3 pr-8 text-base focus:border-primary-500 focus:ring-primary-500 disabled:opacity-50"
              >
                {[...Array(Math.min(10, currentStock || 1)).keys()].map((i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>

              <span className="text-sm text-gray-500 ml-auto">
                {!hasVariations ? (
                  currentStock > 0 ? (
                    "Disponible"
                  ) : (
                    <span className="text-red-500">Agotado</span>
                  )
                ) : selectedVariationId ? (
                  currentStock > 0 ? (
                    `${currentStock} unidades disponibles`
                  ) : (
                    <span className="text-red-500">Agotado</span>
                  )
                ) : (
                  "Selecciona una opción"
                )}
              </span>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={
              (hasVariations && !selectedVariation) || currentStock <= 0
            }
            className="w-full bg-primary-600 text-white font-bold py-4 rounded-lg shadow-sm hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg mt-auto"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
            Agregar a mi Bolsa
          </button>
        </div>
      </div>
    </div>
  );
}
