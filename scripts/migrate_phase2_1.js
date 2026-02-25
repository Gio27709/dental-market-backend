import fs from "fs";
import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Client } = pg;

async function runMigrations() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("No DATABASE_URL found in .env");
    process.exit(1);
  }

  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log("Connected to Supabase DB");

    const migrations = [
      "backend/migrations/001_add_commission_snapshot.sql",
      "backend/migrations/002_create_favorites_table.sql",
      "backend/migrations/003_setup_licenses_storage.sql",
      "backend/migrations/004_update_professional_profiles.sql",
    ];

    for (const file of migrations) {
      console.log(`Applying migration: ${file}`);
      const sql = fs.readFileSync(file, "utf8");
      await client.query(sql);
      console.log(`Successfully applied: ${file}`);
    }

    console.log("All Phase 2.1 migrations applied successfully!");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await client.end();
  }
}

runMigrations();
