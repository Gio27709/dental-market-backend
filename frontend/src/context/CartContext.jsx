/* eslint-disable react-refresh/only-export-components */
import PropTypes from "prop-types";
import { createContext, useState, useEffect, useContext } from "react";
import { useAuth } from "./AuthContext";
import { useProducts } from "./ProductContext";
import {
  generateCartItemUniqueId,
  validateCartItemQuantity,
} from "../utils/cartHelpers";
import {
  fetchCart,
  addCartItem,
  updateCartItemAPI,
  removeCartItemAPI,
  clearCartAPI,
} from "../services/api";

const CartContext = createContext();
const CART_STORAGE_KEY = "dental_market_cart";

export const CartProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { bcvRate } = useProducts();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Totals
  const [totalUsd, setTotalUsd] = useState(0);
  const [totalVes, setTotalVes] = useState(0);
  const [itemCount, setItemCount] = useState(0);

  // 1. Initial State Load (Local or Remote) and Merge logic
  useEffect(() => {
    if (authLoading) return;

    const initializeCart = async () => {
      setLoading(true);
      try {
        if (user) {
          // Verify if we have a lingering local cart that needs to be merged into the DB
          const savedLocal = localStorage.getItem(CART_STORAGE_KEY);
          if (savedLocal) {
            const localItems = JSON.parse(savedLocal);
            // Even if authenticated, we might have freshly logged in or reloaded the tab
            // If they are local items without db_id, we could attempt a merge,
            // but for safety, we just render them instantly while we fetch the remote truth.
            setItems(localItems);

            // Note: If you want to merge fresh anonymous items after login, you'd filter out the ones with db_id here
            // before sending to mergeCartAPI. For now, we trust the DB fetch.
          }

          // Fetch remote cart to overwrite/sync
          await loadRemoteCart();
        } else {
          // Anonymous User Flow
          const savedLocal = localStorage.getItem(CART_STORAGE_KEY);
          if (savedLocal) {
            setItems(JSON.parse(savedLocal));
          } else {
            setItems([]);
          }
        }
      } catch (err) {
        console.error("Failed to initialize cart:", err);
      } finally {
        setLoading(false);
      }
    };

    initializeCart();
  }, [user, authLoading]);

  // 2. Fetch Remote Helper
  const loadRemoteCart = async () => {
    try {
      const { data } = await fetchCart();
      // data corresponds to formattedItems from controller
      // Remap id to frontend_id for UI compatibility if needed, but our controller already gives id, product_id, variation_id etc.
      // Make sure UI components use item.id correctly.
      setItems(
        data.map((item) => ({
          ...item,
          id: item.frontend_id || item.id, // For local compat
          db_id: item.id, // Store real DB PK here
        })),
      );
    } catch (err) {
      console.error("Error fetching remote cart", err);
    }
  };

  // 3. Keep Totals and Local Storage in Sync
  useEffect(() => {
    if (loading) return;

    // Persist to localStorage regardless of auth state to ensure fast reload across tabs
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));

    const calculateTotals = () => {
      const calculatedUsd = items.reduce(
        (acc, item) => acc + item.price_usd * item.quantity,
        0,
      );

      const calculatedCount = items.reduce(
        (acc, item) => acc + Number(item.quantity),
        0,
      );

      setTotalUsd(calculatedUsd);
      setTotalVes(calculatedUsd * (bcvRate || 1));
      setItemCount(calculatedCount);
    };

    calculateTotals();
  }, [items, bcvRate, loading]);

  // 4. Actions
  const addToCart = async (product, variation, quantity = 1) => {
    const variationId = variation?.id || "default";
    const frontendId = generateCartItemUniqueId(product.id, variationId);
    const maxStock = variation?.stock || 999;
    const safeQuantity = validateCartItemQuantity(quantity, maxStock);

    // Calculate new item shape for Optimistic UI
    const newItem = {
      id: frontendId,
      product_id: product.id,
      store_id: product.store_id,
      variation_id: variation?.id || null,
      name: product.name,
      price_usd: product.price + (variation?.price_modifier || 0),
      quantity: safeQuantity,
      image: product.images?.[0] || null,
      variation: variation || null,
      max_stock: maxStock,
    };

    if (user) {
      // Optimistic Remote Logic
      const previousItems = [...items]; // Save for rollback

      setItems((prev) => {
        const existingItem = prev.find((item) => item.id === frontendId);
        if (existingItem) {
          return prev.map((item) =>
            item.id === frontendId
              ? {
                  ...item,
                  quantity: validateCartItemQuantity(
                    Number(item.quantity) + Number(safeQuantity),
                    maxStock,
                  ),
                }
              : item,
          );
        }
        return [...prev, newItem];
      });

      try {
        const response = await addCartItem({
          productId: product.id,
          variationId: variation?.id || null,
          quantity: safeQuantity,
        });

        // If it was a totally new item, swap its temporary ID for the real database ID returning from the API.
        if (response?.data?.item?.id) {
          setItems((currentItems) =>
            currentItems.map((item) =>
              item.id === frontendId
                ? { ...item, db_id: response.data.item.id }
                : item,
            ),
          );
        }
      } catch (err) {
        console.error("Optimistic Add Failed, rolling back", err);
        setItems(previousItems); // Rollback
      }
    } else {
      // Local Cart Logic
      setItems((prev) => {
        const existingItem = prev.find((item) => item.id === frontendId);
        if (existingItem) {
          return prev.map((item) =>
            item.id === frontendId
              ? {
                  ...item,
                  quantity: validateCartItemQuantity(
                    Number(item.quantity) + Number(safeQuantity),
                    maxStock,
                  ),
                }
              : item,
          );
        }
        return [...prev, newItem];
      });
    }
  };

  const removeFromCart = async (itemId) => {
    const previousItems = [...items]; // Save for rollback
    const itemToDelete = items.find((i) => i.id === itemId);

    // Optimistic Delete (Works identical for remote and local)
    setItems((prev) => prev.filter((item) => item.id !== itemId));

    if (user && itemToDelete && itemToDelete.db_id) {
      try {
        await removeCartItemAPI(itemToDelete.db_id);
      } catch (err) {
        console.error("Optimistic Delete Failed, rolling back", err);
        setItems(previousItems); // Rollback
      }
    }
  };

  const updateQuantity = async (itemId, requestedQuantity) => {
    const itemToUpdate = items.find((i) => i.id === itemId);
    if (!itemToUpdate) return;

    const maxStock = itemToUpdate.variation?.stock || 999;
    const safeQuantity = validateCartItemQuantity(
      Number(requestedQuantity),
      maxStock,
    );

    if (user) {
      try {
        if (itemToUpdate.db_id) {
          // Optimistic local update
          setItems((prev) =>
            prev.map((item) =>
              item.id === itemId ? { ...item, quantity: safeQuantity } : item,
            ),
          );
          // Request backend sync
          await updateCartItemAPI(itemToUpdate.db_id, {
            quantity: safeQuantity,
          });
        }
      } catch (err) {
        console.error("Error updating quantity, rolling back", err);
        await loadRemoteCart(); // rollback on failure
      }
    } else {
      setItems((prev) =>
        prev.map((item) => {
          if (item.id === itemId) return { ...item, quantity: safeQuantity };
          return item;
        }),
      );
    }
  };

  const clearCart = async () => {
    if (user) {
      try {
        await clearCartAPI(); // Sends DELETE /api/cart
        setItems([]);
      } catch (err) {
        console.error("Error clearing remote cart", err);
      }
    } else {
      setItems([]);
    }
  };

  // Used exclusively for logging out, avoiding 401 Unauthorized API calls
  const wipeLocalCartOnly = () => {
    setItems([]);
    setTotalUsd(0);
    setTotalVes(0);
    setItemCount(0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        total_usd: totalUsd,
        total_ves: totalVes,
        itemCount,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        wipeLocalCartOnly,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

CartProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
export const useCart = () => useContext(CartContext);
