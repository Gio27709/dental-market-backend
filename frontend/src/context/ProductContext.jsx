/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import PropTypes from "prop-types";
import api, { getProducts } from "../services/api";
import { BCV_RATE_KEY } from "../utils/constants";

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bcvRate, setBcvRate] = useState(() => {
    return localStorage.getItem(BCV_RATE_KEY) || 1;
  });

  const fetchProductsAndSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch concurrently for performance
      const [productsRes, settingsRes] = await Promise.all([
        getProducts(),
        api.get("/admin/settings").catch(() => ({ data: { data: {} } })), // Fallback if settings fail
      ]);

      const productData = productsRes.data.data || productsRes.data;
      setProducts(productData);
      setFilteredProducts(productData);

      // Handle BCV Rate
      const settingsData = settingsRes.data?.data || {};
      if (settingsData.bcv_rate?.rate) {
        const rate = settingsData.bcv_rate.rate;
        setBcvRate(rate);
        localStorage.setItem(BCV_RATE_KEY, rate);
      }
    } catch (err) {
      setError(err.message || "Failed to load catalog data");
    } finally {
      setLoading(false);
    }
  };

  const fetchProductById = useCallback(async (id) => {
    // NOTE: Removed global setLoading() here to prevent infinite React render loops
    // since this function is a dependency in ProductDetail's useEffect.
    const res = await api.get(`/products/${id}`);
    return res.data.data || res.data;
  }, []);

  const applyFilters = useCallback(
    ({ search = "", category = "", maxPrice = null }) => {
      let filtered = [...products];

      if (search) {
        const lowerSearch = search.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(lowerSearch) ||
            (p.description &&
              p.description.toLowerCase().includes(lowerSearch)),
        );
      }

      if (category) {
        filtered = filtered.filter((p) => p.category_id === category);
      }

      if (maxPrice !== null) {
        filtered = filtered.filter((p) => p.price <= maxPrice);
      }

      setFilteredProducts(filtered);
    },
    [products],
  );

  useEffect(() => {
    fetchProductsAndSettings();
  }, []);

  return (
    <ProductContext.Provider
      value={{
        products: filteredProducts, // Always return the filtered view
        allProducts: products, // Access to raw products if needed
        loading,
        error,
        bcvRate,
        fetchProducts: fetchProductsAndSettings,
        fetchProductById,
        applyFilters,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

ProductProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useProducts = () => useContext(ProductContext);
