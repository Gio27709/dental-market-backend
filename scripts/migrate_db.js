import fs from "fs";
import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Client } = pg;

async function runMigration() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("No DATABASE_URL found in .env");
    process.exit(1);
  }

  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log("Connected to Supabase DB");
    const sql = fs.readFileSync(
      "supabase/migrations/20260224150000_init_dentalmarket.sql",
      "utf8",
    );

    // Split the SQL into statements and execute them in a transaction if possible,
    // or just execute the whole block if pg supports it. pg normally supports multi-statement queries.
    await client.query(sql);
    console.log("Migration successfully applied!");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await client.end();
  }
}

runMigration();
