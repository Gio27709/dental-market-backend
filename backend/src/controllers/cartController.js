import { supabaseAdmin } from "../config/supabase.js";

// Helper to get or create a cart for the user
const getOrCreateCartId = async (userId) => {
  const { data: existingCart } = await supabaseAdmin
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existingCart) return existingCart.id;

  const { data: newCart, error: createError } = await supabaseAdmin
    .from("carts")
    .insert([{ user_id: userId }])
    .select("id")
    .maybeSingle();

  if (createError) {
    if (createError.code === "23505") {
      // Race condition lost, another concurrent request created it. Fetch it.
      const { data: retryCart } = await supabaseAdmin
        .from("carts")
        .select("id")
        .eq("user_id", userId)
        .single();
      return retryCart.id;
    }
    console.error("Could not create cart:", createError);
    throw createError;
  }
  return newCart.id;
};

// GET /api/cart
export const getCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const cartId = await getOrCreateCartId(userId);

    // Fetch items with joined product and variation data
    const { data: items, error } = await supabaseAdmin
      .from("cart_items")
      .select(
        `
        id,
        quantity,
        cart_id,
        product_id,
        variation_id,
        products (
          id,
          name,
          price,
          images,
          store_id
        ),
        product_variations (
          id,
          attribute_name,
          attribute_value,
          sku,
          stock,
          price_modifier
        )
      `,
      )
      .eq("cart_id", cartId);

    if (error) throw error;

    // Format for frontend
    const formattedItems = items.map((item) => {
      // Calculate final price based on the product base price + potential variation modifier
      const basePrice = item.products.price;
      const modifier = item.product_variations?.price_modifier || 0;
      const finalPrice = basePrice + modifier;

      return {
        id: item.id, // Primary key of cart_item
        frontend_id: `${item.product_id}-${item.variation_id || "default"}`, // For frontend compat
        product_id: item.product_id,
        store_id: item.products.store_id,
        variation_id: item.variation_id,
        name: item.products.name,
        price_usd: finalPrice,
        quantity: item.quantity,
        image: item.products.images?.[0] || null,
        variation: item.product_variations || null,
        max_stock: item.product_variations?.stock ?? 999,
      };
    });

    res.json(formattedItems);
  } catch (error) {
    console.error("GET Cart Error:", error);
    next(error);
  }
};

// POST /api/cart/items
export const addToCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId, variationId, quantity } = req.body;

    if (!productId || !quantity) {
      return res
        .status(400)
        .json({ error: "Product ID and quantity required" });
    }

    const cartId = await getOrCreateCartId(userId);

    // Concurrency Retry Loop for Race Conditions (Rapid Clicking Spam)
    let retries = 3;
    while (retries > 0) {
      let query = supabaseAdmin
        .from("cart_items")
        .select("id, quantity")
        .eq("cart_id", cartId)
        .eq("product_id", productId);

      if (variationId) {
        query = query.eq("variation_id", variationId);
      } else {
        query = query.is("variation_id", null);
      }

      const { data: existingItem } = await query.maybeSingle();

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        const { data: updated, error } = await supabaseAdmin
          .from("cart_items")
          .update({ quantity: newQuantity })
          .eq("id", existingItem.id)
          .select()
          .maybeSingle();

        if (error) throw error;
        return res
          .status(200)
          .json({ message: "Quantity updated", item: updated });
      } else {
        const { data: inserted, error } = await supabaseAdmin
          .from("cart_items")
          .insert([
            {
              cart_id: cartId,
              product_id: productId,
              variation_id: variationId || null,
              quantity: quantity,
            },
          ])
          .select()
          .maybeSingle();

        if (error) {
          if (error.code === "23505" && retries > 1) {
            // Concurrent request successfully added it before us. Loop again to Update instead!
            retries--;
            continue;
          }
          throw error;
        }
        return res.status(201).json({ message: "Item added", item: inserted });
      }
    }
  } catch (error) {
    console.error("Add to cart master error:", error);
    next(error);
  }
};

// PATCH /api/cart/items/:id
// :id here is the cart_items primary key UUID
export const updateCartItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const itemId = req.params.id; // UUID of cart_item
    const { quantity } = req.body;

    if (quantity === undefined || quantity < 1) {
      return res.status(400).json({ error: "Valid quantity required" });
    }

    // Verify ownership safely
    const { data: itemData } = await supabaseAdmin
      .from("cart_items")
      .select("cart_id")
      .eq("id", itemId)
      .maybeSingle();

    if (!itemData) return res.status(404).json({ error: "Item not found" });

    const { data: cartData } = await supabaseAdmin
      .from("carts")
      .select("user_id")
      .eq("id", itemData.cart_id)
      .maybeSingle();

    if (!cartData || cartData.user_id !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { data: updated, error } = await supabaseAdmin
      .from("cart_items")
      .update({ quantity })
      .eq("id", itemId)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: "Quantity updated", item: updated });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/cart/items/:id
export const removeFromCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const itemId = req.params.id;

    // Verify ownership safely
    const { data: itemData } = await supabaseAdmin
      .from("cart_items")
      .select("cart_id")
      .eq("id", itemId)
      .maybeSingle();

    if (!itemData) return res.status(404).json({ error: "Item not found" });

    const { data: cartData } = await supabaseAdmin
      .from("carts")
      .select("user_id")
      .eq("id", itemData.cart_id)
      .maybeSingle();

    if (!cartData || cartData.user_id !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { error } = await supabaseAdmin
      .from("cart_items")
      .delete()
      .eq("id", itemId);

    if (error) throw error;

    res.json({ message: "Item removed" });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/cart
export const clearCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const cartId = await getOrCreateCartId(userId);

    const { error } = await supabaseAdmin
      .from("cart_items")
      .delete()
      .eq("cart_id", cartId);

    if (error) throw error;

    res.json({ message: "Cart cleared" });
  } catch (error) {
    next(error);
  }
};

// POST /api/cart/merge
// Called when unauthenticated user logs in with a local cart
export const mergeCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { items: localItems } = req.body; // Array of formatted frontend cart items

    if (!localItems || !Array.isArray(localItems) || localItems.length === 0) {
      return res.json({ message: "No local items to merge" });
    }

    const cartId = await getOrCreateCartId(userId);

    for (const local of localItems) {
      const { product_id, variation_id, quantity } = local;

      // Find if exists
      // Supabase JS tricky regarding `is null` for variation_id
      let query = supabaseAdmin
        .from("cart_items")
        .select("id, quantity")
        .eq("cart_id", cartId)
        .eq("product_id", product_id);

      if (variation_id) {
        query = query.eq("variation_id", variation_id);
      } else {
        query = query.is("variation_id", null);
      }

      const { data: existingItem } = await query.maybeSingle();

      if (existingItem) {
        // Sum both quantities so guest + account carts accumulate
        const mergedQuantity = existingItem.quantity + quantity;
        await supabaseAdmin
          .from("cart_items")
          .update({ quantity: mergedQuantity })
          .eq("id", existingItem.id);
      } else {
        // Insert new
        await supabaseAdmin.from("cart_items").insert([
          {
            cart_id: cartId,
            product_id: product_id,
            variation_id: variation_id || null,
            quantity: quantity,
          },
        ]);
      }
    }

    res.json({ message: "Merge completed successfully" });
  } catch (error) {
    next(error);
  }
};
