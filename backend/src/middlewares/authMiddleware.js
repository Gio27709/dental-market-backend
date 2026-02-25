import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

// Create a client that only utilizes the Anon Key to perform token verification
// using the robust Supabase Auth endpoint (Doesn't sign users in, just verifies payload remotely).
// Alternatively, jsonwebtoken could be used to verify signature against JWT_SECRET locally.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase Anon Config missing, Auth Middleware might fail.");
}

const supabaseAuthClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "Missing or malformed Authorization header" });
    }

    const token = authHeader.split(" ")[1];

    // Let Supabase directly decode and verify the JWT.
    // This is highly secure and prevents forging since it hits their endpoint.
    const {
      data: { user },
      error,
    } = await supabaseAuthClient.auth.getUser(token);

    if (error || !user) {
      return res
        .status(401)
        .json({ error: "Invalid or expired token", details: error?.message });
    }

    // Parse user role and IDs into the Express Request Object
    req.user = {
      id: user.id,
      email: user.email,
      role: user.app_metadata?.role || user.user_metadata?.role || "buyer",
      verified: user.user_metadata?.is_verified ?? false,
    };

    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err);
    res
      .status(500)
      .json({ error: "Internal server error during authentication" });
  }
};

export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({
          error: `Forbidden: Requires one of [${allowedRoles.join(",")}]`,
        });
    }

    next();
  };
};
