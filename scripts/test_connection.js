import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or Key in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log("Testing connection to:", supabaseUrl);

  // Try to select from a table that might not exist yet, or just check health
  // We'll try to fetch categories. If table missing, it returns error code '42P01' (undefined_table)
  // If connection fails, it throws network error.

  try {
    const { error } = await supabase
      .from("categories")
      .select("count", { count: "exact", head: true });

    if (error) {
      if (error.code === "42P01") {
        console.log("✅ Connection Sucessful! (But tables do not exist yet)");
        console.log("Action needed: Run the SQL script in Supabase Dashboard.");
      } else {
        console.error("❌ Connection Error:", error.message, error.code);
      }
    } else {
      console.log("✅ Connection Successful! Tables exist.");
    }
  } catch (err) {
    console.error("❌ Network/Client Error:", err.message);
  }
}

testConnection();
