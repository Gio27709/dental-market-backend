import axios from "axios";
import { supabase } from "../lib/supabaseClient";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Intercept requests and inject the live Supabase JWT token dynamically
api.interceptors.request.use(
  async (config) => {
    // Await the fastest, local session directly from the Supabase client
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }

    // Debugging interceptor
    if (config.url?.includes("/orders") && config.method === "post") {
      console.log(
        "🔥 OUTGOING PAYLOAD TO /orders:",
        JSON.stringify(config.data, null, 2),
      );
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Global Error Handler Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        console.warn("Unauthorized API call, redirecting down gracefully...");
      } else if (error.response.status === 404) {
        console.warn("Resource not found from API.");
      } else if (error.response.status >= 500) {
        console.error("Critical Backend Failure. API is down or failing.");
      }
    } else if (error.request) {
      console.error("Network error. No response received.");
    }
    // Pass the actual backend error message through to the caller if available
    if (error.response?.data?.error) {
      error.message = error.response.data.error;
    }

    return Promise.reject(error);
  },
);

export const getProducts = () => api.get("/products");
// Native login/register runs directly hitting Supabase. We only use api for business logic:
export const createOrder = (orderData) => api.post("/orders", orderData);
export const getMyOrders = (config = {}) => api.get("/orders", config);
export const getOrderByIdAPI = (id) => api.get(`/orders/${id}`);
export const uploadPaymentProofAPI = (id, formData) =>
  api.post(`/orders/${id}/payment-proof`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

// Admin Escrow API
export const approvePaymentAPI = (id) =>
  api.put(`/admin/orders/${id}/approve-payment`);
export const rejectPaymentAPI = (id, reason) =>
  api.put(`/admin/orders/${id}/reject-payment`, { reason });

// Cart Database Sync API
export const fetchCart = () => api.get("/cart");
export const addCartItem = (data) => api.post("/cart/items", data);
export const updateCartItemAPI = (id, data) =>
  api.patch(`/cart/items/${id}`, data);
export const removeCartItemAPI = (id) => api.delete(`/cart/items/${id}`);
export const clearCartAPI = () => api.delete("/cart");
export const mergeCartAPI = (items) => api.post("/cart/merge", { items });

// Exporting standard API for frontend endpoints
export default api;
