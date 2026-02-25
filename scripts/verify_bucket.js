import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Client } = pg;

async function verifyBucket() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("No DATABASE_URL found in .env");
    process.exit(1);
  }

  const client = new Client({ connectionString });
  try {
    await client.connect();

    const result = await client.query(`
      SELECT id, name, public, created_at 
      FROM storage.buckets 
      WHERE id = 'licenses';
    `);

    if (result.rows.length > 0) {
      console.table(result.rows);
      if (result.rows[0].public === false) {
        console.log("✅ El bucket 'licenses' existe y es PRIVADO.");
      } else {
        console.log("❌ El bucket 'licenses' existe pero es PÚBLICO.");
      }
    } else {
      console.log("❌ El bucket 'licenses' NO existe en storage.buckets.");
    }
  } catch (err) {
    console.error("Error verifying bucket:", err);
  } finally {
    await client.end();
  }
}

verifyBucket();
