import { supabaseAdmin } from "../config/supabase.js";

export const getSettings = async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("global_settings")
      .select("*");
    if (error) throw error;

    // Transform setting pairs [{key: 'x', value: {}}] into a friendly hashmap for frontend
    const settingsMap = data.reduce((acc, current) => {
      acc[current.key] = current.value;
      return acc;
    }, {});

    res.status(200).json({ success: true, data: settingsMap });
  } catch (err) {
    next(err);
  }
};

export const updateBcvRate = async (req, res, next) => {
  try {
    const { rate } = req.body;
    if (!rate || isNaN(rate) || rate <= 0)
      return res.status(400).json({ error: "Valid BCV rate required" });

    const payload = { rate, updated_at: new Date().toISOString() };

    const { data, error } = await supabaseAdmin
      .from("global_settings")
      .upsert([{ key: "bcv_rate", value: payload }], { onConflict: "key" })
      .select();

    if (error) throw error;
    res.status(200).json({ success: true, message: "BCV rate updated", data });
  } catch (err) {
    next(err);
  }
};

export const updateCommission = async (req, res, next) => {
  try {
    const { percentage } = req.body;
    if (
      !percentage ||
      isNaN(percentage) ||
      percentage < 0 ||
      percentage > 100
    ) {
      return res
        .status(400)
        .json({ error: "Valid commission percentage (0-100) required" });
    }

    const payload = { percentage, updated_at: new Date().toISOString() };

    const { data, error } = await supabaseAdmin
      .from("global_settings")
      .upsert([{ key: "platform_fee", value: payload }], { onConflict: "key" })
      .select();

    if (error) throw error;
    res
      .status(200)
      .json({ success: true, message: "Platform commission updated", data });
  } catch (err) {
    next(err);
  }
};
