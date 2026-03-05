import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function setup() {
  console.log("Setting up payment proofs bucket...");

  // 1. Create uploads folder
  if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
    console.log("Created local uploads directory");
  }

  // 2. Check/Create Bucket
  const { data, error } =
    await supabaseAdmin.storage.getBucket("payment_proofs");

  if (error) {
    console.log(
      "Bucket doesn't exist or isn't accessible, creating 'payment_proofs'...",
    );
    const { data: newBucket, error: createError } =
      await supabaseAdmin.storage.createBucket("payment_proofs", {
        public: false, // We usually don't want payment proofs fully public, but can adjust
        fileSizeLimit: 5242880, // 5MB
      });

    if (createError) {
      console.error("Failed to create bucket:", createError);
    } else {
      console.log("Successfully created bucket:", newBucket);
    }
  } else {
    console.log("Bucket 'payment_proofs' already exists.");
  }
}

setup();
