import { useState, useEffect } from "react";
import { productService } from "../services/productService";

export const useProducts = ({
  category,
  brand,
  featured,
  isNew,
  limit,
} = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await productService.getProducts({
          category,
          brand,
          featured,
          isNew,
          limit,
        });
        setProducts(data);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, brand, featured, isNew, limit]);

  return { products, loading, error };
};

export const useExchangeRate = () => {
  const [rate, setRate] = useState(1); // Default 1 USD = 1 USD
  const [currency, setCurrency] = useState("USD");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const settings = await productService.getSettings();
        if (settings.exchange_rate) {
          setRate(settings.exchange_rate.rate);
          setCurrency(settings.exchange_rate.currency_to); // e.g. "VES"
        }
      } catch (err) {
        console.error("Error fetching exchange rate:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRate();
  }, []);

  // Helper to convert price
  const convertPrice = (priceInUsd) => {
    return priceInUsd * rate;
  };

  const formatPrice = (priceInUsd) => {
    const converted = priceInUsd * rate;
    return new Intl.NumberFormat("es-VE", {
      style: "currency",
      currency: currency === "USD" ? "USD" : "VES", // Fallback to USD if not VES
    }).format(converted);
  };

  return { rate, currency, loading, convertPrice, formatPrice };
};
