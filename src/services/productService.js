import { supabase } from "../lib/supabaseClient";

export const productService = {
  /**
   * Fetch all products with optional filters
   */
  async getProducts({ category, brand, featured, isNew, limit } = {}) {
    let query = supabase.from("products").select(`
      *,
      categories!inner(*),
      brands(*)
    `);

    if (category) query = query.eq("categories.slug", category);
    if (brand) query = query.eq("brands.slug", brand);
    if (featured) query = query.eq("is_featured", true);
    if (isNew) query = query.eq("is_new", true);
    if (limit) query = query.limit(limit);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  /**
   * Fetch a single product by slug
   */
  async getProductBySlug(slug) {
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        categories (name, slug),
        brands (name, slug)
      `,
      )
      .eq("slug", slug)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Fetch categories
   */
  async getCategories() {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (error) throw error;
    return data;
  },

  /**
   * Fetch current store settings (Exchange Rate)
   */
  async getSettings() {
    const { data, error } = await supabase
      .from("exchange_rates")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") throw error; // Ignore row not found initially

    const settings = {
      exchange_rate: {
        rate: data?.rate_bcv || 1,
        currency_to: data?.currency_to || "VES",
      },
    };

    return settings;
  },
};
