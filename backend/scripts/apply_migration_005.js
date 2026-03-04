import fs from "fs";
import path from "path";
import pkg from "pg";
import { fileURLToPath } from "url";

const { Client } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  const dbUrl =
    "postgresql://postgres.upzodyuuikrwosliscgy:Giovany123.@aws-1-us-east-1.pooler.supabase.com:5432/postgres";

  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log("Connecting to Supabase DB...");
    await client.connect();

    const sqlPath = path.join(
      __dirname,
      "..",
      "migrations",
      "005_create_cart_tables.sql",
    );
    const sqlScript = fs.readFileSync(sqlPath, "utf8");

    console.log("Applying Migration...");
    await client.query(sqlScript);

    console.log("Migration applied successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await client.end();
  }
}

runMigration();
