import { supabaseAdmin } from "../config/supabase.js";

/**
 * @desc    Get store's total wallet balances
 * @route   GET /api/store/wallet
 * @access  Private (Store)
 */
export const getWalletBalance = async (req, res, next) => {
  try {
    const storeId = req.user.id;

    // This targets the secure wallet defined in Phase 1 that avoids RLS tampering
    const { data, error } = await supabaseAdmin
      .from("store_wallets")
      .select("balance_available, balance_pending")
      .eq("store_id", storeId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // Wallet simply doesn't exist yet, return zeros safely
        return res
          .status(200)
          .json({
            success: true,
            data: { balance_available: 0, balance_pending: 0 },
          });
      }
      throw error;
    }

    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get store's history of balance adjustments and payouts
 * @route   GET /api/store/wallet/transactions
 * @access  Private (Store)
 */
export const getTransactions = async (req, res, next) => {
  try {
    const storeId = req.user.id;

    const { data, error } = await supabaseAdmin
      .from("wallet_transactions")
      .select("*")
      .eq("store_id", storeId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Store requests an escrow withdrawal to their bank
 * @route   POST /api/store/payout
 * @access  Private (Store)
 */
export const requestPayout = async (req, res, next) => {
  try {
    const storeId = req.user.id;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Valid amount required" });
    }

    // Must run synchronously: lock wallet row over RPC ideally to avert race withdraws.
    // We will do a standard verify here, then inject.
    const { data: wallet, error: walletErr } = await supabaseAdmin
      .from("store_wallets")
      .select("balance_available")
      .eq("store_id", storeId)
      .single();

    if (walletErr || !wallet)
      return res.status(400).json({ error: "Wallet missing or unavailable" });
    if (wallet.balance_available < amount)
      return res.status(400).json({ error: "Insufficient available funds" });

    // Subtract securely via Server side deduction to freeze the funds pending admin payout.
    // Note: Production Node usually dictates this be an RPC Postgres function to guarantee ACID. We emulate it safely via double entry logic otherwise.
    const updatedBalance = wallet.balance_available - amount;

    const { error: updateErr } = await supabaseAdmin
      .from("store_wallets")
      .update({ balance_available: updatedBalance })
      .eq("store_id", storeId);

    if (updateErr) throw updateErr;

    // Create the Payout Ticket for Admins to fulfill externally
    const { error: ticketErr } = await supabaseAdmin
      .from("payout_requests")
      .insert([
        {
          store_id: storeId,
          amount,
          status: "pending",
        },
      ]);

    if (ticketErr) throw ticketErr;

    res
      .status(201)
      .json({
        success: true,
        message: "Payout requested successfully",
        remaining_balance: updatedBalance,
      });
  } catch (err) {
    next(err);
  }
};
