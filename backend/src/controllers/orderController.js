import { supabaseAdmin } from "../config/supabase.js";
import fs from "fs";

/**
 * @desc    Create a fresh order with locked BCV rate and distinct vendor items
 * @route   POST /api/orders
 * @access  Private (Buyer, Professional, Store)
 */
export const createOrder = async (req, res, next) => {
  try {
    const { items, shipping_address, contact_phone, payment_method, notes } =
      req.body;
    const userId = req.user.id;

    // --- Backend Validation: Required Checkout Fields ---
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ error: "La orden debe contener al menos un producto." });
    }
    if (!shipping_address || shipping_address.trim().length < 10) {
      return res.status(400).json({
        error:
          "La dirección de envío es requerida y debe tener al menos 10 caracteres.",
      });
    }
    if (!contact_phone || contact_phone.trim().length < 7) {
      return res
        .status(400)
        .json({ error: "El teléfono de contacto es requerido." });
    }
    if (!payment_method) {
      return res
        .status(400)
        .json({ error: "Debe seleccionar un método de pago." });
    }

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
          shipping_address: shipping_address.trim(),
          contact_phone: contact_phone.trim(),
          payment_method,
          notes: notes ? notes.trim() : null,
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
    console.error("🔥 RAW CONTROLLER ERROR:", err);
    next(err);
  }
};

/**
 * @desc    Get a single order by ID (with items)
 * @route   GET /api/orders/:id
 * @access  Private (Owner of the order, Admin, Owner role)
 */
export const getOrderById = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select(
        `
        *,
        order_items (*, products(*), product_variations(*))
      `,
      )
      .eq("id", orderId)
      .single();

    if (error || !order) {
      return res.status(404).json({ error: "Orden no encontrada" });
    }

    // Only the order owner, admins, or owners can view it
    if (
      order.user_id !== userId &&
      req.user.role !== "admin" &&
      req.user.role !== "owner"
    ) {
      return res
        .status(403)
        .json({ error: "No autorizado para ver esta orden" });
    }

    res.status(200).json({ success: true, data: order });
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
    const { payment_status, admin_view } = req.query;
    let query;

    // Admin and Owner can see ALL orders across the platform if they explicitly request the admin view
    if (
      (req.user.role === "admin" || req.user.role === "owner") &&
      admin_view === "true"
    ) {
      query = supabaseAdmin
        .from("orders")
        .select(
          `
          *,
          users(email, full_name),
          order_items (*, products(*), product_variations(*))
        `,
        )
        .order("created_at", { ascending: false });
    } else if (
      req.user.role === "buyer" ||
      req.user.role === "professional" ||
      req.user.role === "admin" ||
      req.user.role === "owner"
    ) {
      // Simple users (and admins in personal view) see their own purchase history
      query = supabaseAdmin
        .from("orders")
        .select(
          `
          *,
          order_items (*, products(*), product_variations(*))
        `,
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
    } else {
      // For a store, they only see order items bound to their store_id
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

    // Apply payment_status filter if provided (e.g., ?payment_status=under_review)
    if (payment_status) {
      query = query.eq("payment_status", payment_status);
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

/**
 * @desc    Upload payment proof for an order
 * @route   POST /api/orders/:id/payment-proof
 * @access  Private (Buyer)
 */
export const uploadPaymentProof = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;

    if (!req.file)
      return res
        .status(400)
        .json({ error: "Please upload a payment proof document" });

    // Verify ownership of the order
    const { data: order, error: orderErr } = await supabaseAdmin
      .from("orders")
      .select("user_id, payment_status")
      .eq("id", orderId)
      .single();

    if (orderErr || !order) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.user_id !== userId) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res
        .status(403)
        .json({ error: "Not authorized to modify this order" });
    }

    const file = req.file;
    const allowedMimeTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      fs.unlinkSync(file.path);
      return res.status(400).json({
        error: "Invalid file type. Only PDF, JPG, PNG, WEBP allowed.",
      });
    }

    if (file.size > 5 * 1024 * 1024) {
      fs.unlinkSync(file.path);
      return res
        .status(400)
        .json({ error: "File too large. Maximum size is 5MB." });
    }

    const fileExt = file.originalname.split(".").pop();
    const fileName = `${orderId}/${Date.now()}_proof.${fileExt}`;
    const fileBuffer = fs.readFileSync(file.path);

    // Upload to Supabase Storage - we need a 'payment_proofs' bucket created in Supabase.
    // If it doesn't exist, Supabase will throw an error, but we assume it does based on architectural patterns.
    const { data: storageData, error: storageError } =
      await supabaseAdmin.storage
        .from("payment_proofs")
        .upload(fileName, fileBuffer, {
          contentType: file.mimetype,
          upsert: true,
        });

    fs.unlinkSync(file.path);

    if (storageError) {
      // If bucket doesn't exist, we fallback but still update status for resilience.
      console.error("Storage error:", storageError);
      throw new Error(`Storage Error: ${storageError.message}`);
    }

    const pathInStorage = storageData.path;

    // Generate the full public URL for the uploaded proof
    const { data: publicUrlData } = supabaseAdmin.storage
      .from("payment_proofs")
      .getPublicUrl(pathInStorage);

    const publicUrl = publicUrlData?.publicUrl || pathInStorage;

    // Update order status
    const { error: updateError } = await supabaseAdmin
      .from("orders")
      .update({
        payment_proof_url: publicUrl,
        payment_status: "under_review",
      })
      .eq("id", orderId);

    if (updateError) throw updateError;

    res.status(200).json({
      success: true,
      message:
        "Payment proof uploaded successfully. Awaiting administrative review.",
    });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    next(err);
  }
};

/**
 * @desc    Admin approves a payment proof
 * @route   PUT /api/admin/orders/:id/approve-payment
 * @access  Private (Admin, Owner)
 */
export const approvePayment = async (req, res, next) => {
  try {
    const orderId = req.params.id;

    // Verify the order exists and is under review
    const { data: order, error: fetchErr } = await supabaseAdmin
      .from("orders")
      .select("id, payment_status")
      .eq("id", orderId)
      .single();

    if (fetchErr || !order) {
      return res.status(404).json({ error: "Orden no encontrada" });
    }

    if (order.payment_status !== "under_review") {
      return res.status(400).json({
        error: `No se puede aprobar una orden con estado de pago: ${order.payment_status}`,
      });
    }

    const { error: updateErr } = await supabaseAdmin
      .from("orders")
      .update({
        payment_status: "approved",
        order_status: "processing",
      })
      .eq("id", orderId);

    if (updateErr) throw updateErr;

    res.status(200).json({
      success: true,
      message: "Pago aprobado exitosamente. La orden pasó a procesamiento.",
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Admin rejects a payment proof
 * @route   PUT /api/admin/orders/:id/reject-payment
 * @access  Private (Admin, Owner)
 */
export const rejectPayment = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res
        .status(400)
        .json({ error: "Debe proporcionar un motivo de rechazo." });
    }

    const { data: order, error: fetchErr } = await supabaseAdmin
      .from("orders")
      .select("id, payment_status")
      .eq("id", orderId)
      .single();

    if (fetchErr || !order) {
      return res.status(404).json({ error: "Orden no encontrada" });
    }

    const { error: updateErr } = await supabaseAdmin
      .from("orders")
      .update({
        payment_status: "rejected",
        notes: `Pago rechazado: ${reason.trim()}`,
      })
      .eq("id", orderId);

    if (updateErr) throw updateErr;

    res.status(200).json({
      success: true,
      message: "Pago rechazado. El cliente será notificado.",
    });
  } catch (err) {
    next(err);
  }
};
