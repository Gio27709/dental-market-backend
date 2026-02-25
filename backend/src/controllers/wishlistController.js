import { supabaseAdmin } from "../config/supabase.js";

/**
 * @desc    Get user's favorite products
 * @route   GET /api/wishlist
 * @access  Private
 */
export const getFavorites = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabaseAdmin
      .from("favorites")
      .select(
        `
        id, created_at,
        products (*, product_variations (*), store_profiles (business_name, rating_avg))
      `,
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Check if a product is in favorites
 * @route   GET /api/wishlist/check/:product_id
 * @access  Private
 */
export const checkFavorite = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const productId = req.params.product_id;

    const { data, error } = await supabaseAdmin
      .from("favorites")
      .select("id")
      .eq("user_id", userId)
      .eq("product_id", productId)
      .maybeSingle();

    if (error) throw error;
    res.status(200).json({ success: true, is_favorite: !!data });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Add product to favorites
 * @route   POST /api/wishlist/:product_id
 * @access  Private
 */
export const addFavorite = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const productId = req.params.product_id;

    const { data, error } = await supabaseAdmin
      .from("favorites")
      .insert([{ user_id: userId, product_id: productId }])
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        // Unique violation, already exists
        return res
          .status(400)
          .json({ error: "Product is already in favorites" });
      }
      throw error;
    }

    res
      .status(201)
      .json({ success: true, message: "Added to favorites", data });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Remove product from favorites
 * @route   DELETE /api/wishlist/:product_id
 * @access  Private
 */
export const removeFavorite = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const productId = req.params.product_id;

    const { error } = await supabaseAdmin
      .from("favorites")
      .delete()
      .eq("user_id", userId)
      .eq("product_id", productId);

    if (error) throw error;
    res.status(200).json({ success: true, message: "Removed from favorites" });
  } catch (err) {
    next(err);
  }
};
