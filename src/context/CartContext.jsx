/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch from DB if user logs in
  useEffect(() => {
    if (user) {
      fetchDBCart();
    } else {
      // Clear memory cart on logout
      setCartItems([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchDBCart = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("cart_items")
      .select(
        `
        id,
        quantity,
        variation_id,
        product:products (
          id,
          title,
          slug,
          price_usd,
          images
        )
      `,
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching Cartesian items:", error);
    } else if (data) {
      setCartItems(data);
    }
    setLoading(false);
  };

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  const addToCart = async (product, quantity = 1, variation_id = null) => {
    if (!user) {
      alert("Please log in to add items to your cart."); // Temporary fallback
      return;
    }

    // Check if it already exists
    const existingIndex = cartItems.findIndex(
      (item) =>
        item.product.id === product.id && item.variation_id === variation_id,
    );

    if (existingIndex >= 0) {
      const existingItem = cartItems[existingIndex];
      await updateQuantity(existingItem.id, existingItem.quantity + quantity);
      setIsDrawerOpen(true);
      return;
    }

    // Insert to DB
    const { data, error } = await supabase
      .from("cart_items")
      .insert([
        { user_id: user.id, product_id: product.id, variation_id, quantity },
      ])
      .select(
        `
        id,
        quantity,
        variation_id,
        product:products (id, title, slug, price_usd, images)
      `,
      )
      .single();

    if (error) {
      console.error("Error inserting to cart:", error.message);
    } else if (data) {
      setCartItems((prev) => [...prev, data]);
      setIsDrawerOpen(true);
    }
  };

  const updateQuantity = async (cartItemId, newQuantity) => {
    if (!user) return;

    if (newQuantity <= 0) {
      return removeFromCart(cartItemId);
    }

    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: newQuantity })
      .eq("id", cartItemId)
      .eq("user_id", user.id);

    if (!error) {
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === cartItemId ? { ...item, quantity: newQuantity } : item,
        ),
      );
    } else {
      console.error("Error updating quantity:", error.message);
    }
  };

  const removeFromCart = async (cartItemId) => {
    if (!user) return;

    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", cartItemId)
      .eq("user_id", user.id);

    if (!error) {
      setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
    } else {
      console.error("Error deleting from cart:", error.message);
    }
  };

  const clearCart = async () => {
    if (!user) return;
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", user.id);

    if (!error) {
      setCartItems([]);
    }
  };

  const cartTotal = cartItems.reduce(
    (total, item) => total + (item.product?.price_usd || 0) * item.quantity,
    0,
  );

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        isDrawerOpen,
        toggleDrawer,
        setIsDrawerOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
