import { supabaseAdmin } from "../config/supabase.js";

/**
 * @desc    Create a fresh order with locked BCV rate and distinct vendor items
 * @route   POST /api/orders
 * @access  Private (Buyer, Professional, Store)
 */
export const createOrder = async (req, res, next) => {
  try {
    const { items } = req.body;
    const userId = req.user.id;

    // 1. Fetch current BCV rate and platform fee
    const { data: settingsData, error: settingsError } = await supabaseAdmin
      .from("global_settings")
      .select("key, value")
      .in("key", ["bcv_rate", "platform_fee"]);

    if (settingsError || !settingsData || settingsData.length === 0)
      throw new Error("Could not fetch global settings");

    const bcvSetting = settingsData.find((s) => s.key === "bcv_rate");
    const feeSetting = settingsData.find((s) => s.key === "platform_fee");

    const exchangeRateAtPurchase = bcvSetting?.value?.rate || 1;
    const commissionRateAtPurchase = feeSetting?.value?.percentage || 0;

    // 2. Compute Totals
    const totalUsd = items.reduce(
      (acc, current) => acc + current.quantity * current.unit_price,
      0,
    );
    const totalVes = totalUsd * exchangeRateAtPurchase;

    // Commission Math
    const commissionAmountUsd = (totalUsd * commissionRateAtPurchase) / 100;
    const commissionAmountVes = commissionAmountUsd * exchangeRateAtPurchase;

    // 3. Create the Main Order Header
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert([
        {
          user_id: userId,
          total: totalUsd, // legacy compliance
          total_usd: totalUsd,
          total_ves: totalVes,
          exchange_rate_at_purchase: exchangeRateAtPurchase,
          commission_rate_at_purchase: commissionRateAtPurchase,
          commission_amount_usd: commissionAmountUsd,
          commission_amount_ves: commissionAmountVes,
          payment_status: "pending",
          order_status: "pending",
          escrow_status: "held",
        },
      ])
      .select()
      .single();

    if (orderError) throw orderError;

    // 4. Create standard unfulfilled detail item rows
    // Notice `delivery_status` is implicitly 'pending'. Stock trigger doesn't fire yet.
    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id, // can be derived from variation ideally, assuming client ships it if possible
      variation_id: item.variation_id,
      store_id: item.store_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      delivery_status: "pending",
    }));

    const { error: itemsError } = await supabaseAdmin
      .from("order_items")
      .insert(orderItems);

    if (itemsError) throw itemsError;

    res
      .status(201)
      .json({ success: true, message: "Order created", data: order });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get user's purchased orders or store's sold items
 * @route   GET /api/orders
 * @access  Private
 */
export const getOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let query;

    // If simple user, grab their purchase history
    if (req.user.role === "buyer" || req.user.role === "professional") {
      query = supabaseAdmin
        .from("orders")
        .select(
          `
                    *,
                    order_items (*, product_variations(*))
                `,
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
    } else {
      // For a store, they only see order items bound to their store_id, and infer the parent order details loosely.
      // A more complex join typically required, this is a flattened version via order_items.
      query = supabaseAdmin
        .from("order_items")
        .select(
          `
                    *,
                    orders (*),
                    product_variations (*)
                `,
        )
        .eq("store_id", userId)
        .order("created_at", { ascending: false });
    }

    const { data, error } = await query;
    if (error) throw error;

    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Store marks their item fragment of the order as Shipped
 * @route   PUT /api/store/orders/:item_id/ship
 * @access  Private (Store, Owner)
 */
export const shipOrderItem = async (req, res, next) => {
  try {
    const itemId = req.params.item_id;
    const storeId = req.user.id;
    const { tracking_code, shipping_carrier } = req.body;

    // Verify ownership
    const { data: itemData, error: itemErr } = await supabaseAdmin
      .from("order_items")
      .select("store_id, delivery_status")
      .eq("id", itemId)
      .single();

    if (itemErr || !itemData)
      return res.status(404).json({ error: "Order item not found" });

    if (req.user.role !== "owner" && itemData.store_id !== storeId) {
      return res
        .status(403)
        .json({ error: "Cannot ship an item belonging to another store" });
    }

    if (
      itemData.delivery_status !== "pending" &&
      itemData.delivery_status !== "confirmed"
    ) {
      return res.status(400).json({
        error: `Cannot ship an item with status ${itemData.delivery_status}`,
      });
    }

    // Updating to 'shipped' triggers the decrement_stock_on_order Postgres trigger Phase 1.1!
    const { error: updateErr } = await supabaseAdmin
      .from("order_items")
      .update({
        delivery_status: "shipped",
        tracking_code,
        shipping_carrier,
      })
      .eq("id", itemId);

    // Standard Postgres trigger error propagation for low stock will be caught here and sent to Global Handler
    if (updateErr) throw updateErr;

    res
      .status(200)
      .json({ success: true, message: "Item shipped and stock deduced." });
  } catch (err) {
    next(err);
  }
};
