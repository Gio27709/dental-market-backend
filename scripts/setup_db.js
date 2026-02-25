import pg from "pg";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Client } = pg;

async function setupDatabase() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error("❌ Error: DATABASE_URL is missing in .env file.");
    console.error(
      '👉 Please add DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres" to your .env file.',
    );
    process.exit(1);
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }, // Required for Supabase
  });

  try {
    await client.connect();
    console.log("✅ Connected to Supabase Database!");

    // 1. Read and Execute Schema
    const schemaPath = path.join(__dirname, "../src/lib/schema.sql");
    const schemaSql = fs.readFileSync(schemaPath, "utf8");

    console.log("🚀 Running Schema Migration...");
    await client.query(schemaSql);
    console.log("✅ Schema applied successfully.");

    // 2. Read and Insert Seed Data
    const seedPath = path.join(__dirname, "../src/lib/seed_data.json");
    const seedData = JSON.parse(fs.readFileSync(seedPath, "utf8"));

    console.log("🌱 Seeding Data...");

    // Categories
    for (const cat of seedData.categories) {
      await client.query(
        `INSERT INTO public.categories (name, slug, image_url) 
         VALUES ($1, $2, $3) 
         ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
         RETURNING id`,
        [cat.name, cat.slug, cat.image_url],
      );
      // Store ID for mapping if needed, but we used slug logic in seed file
      // Actually, simple seed data uses slugs to link products, so we need to fetch IDs.
    }
    console.log(
      `   - Inserted/Updated ${seedData.categories.length} Categories.`,
    );

    // Brands
    for (const brand of seedData.brands) {
      await client.query(
        `INSERT INTO public.brands (name, slug) 
         VALUES ($1, $2) 
         ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name`,
        [brand.name, brand.slug],
      );
    }
    console.log(`   - Inserted/Updated ${seedData.brands.length} Brands.`);

    // Exchange Rates
    for (const rate of seedData.exchange_rates) {
      await client.query(
        `INSERT INTO public.exchange_rates (rate_bcv, currency_from, currency_to)
             VALUES ($1, $2, $3)`,
        [rate.rate_bcv, rate.currency_from, rate.currency_to],
      );
    }
    console.log(`   - Inserted Exchange Rates.`);

    // Set up Mock Store Owner & Store
    const mockUserId = "00000000-0000-0000-0000-000000000000";
    const mockStoreId = "11111111-1111-1111-1111-111111111111";

    // Attempt to insert auth user (might fail based on permissions, but we try)
    try {
      await client.query(
        `
        INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at) 
        VALUES ($1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@store.com', 'dummy', now(), now(), now())
        ON CONFLICT DO NOTHING;
      `,
        [mockUserId],
      );
    } catch {
      console.log(
        "   - Note: Skipping auth.users mock insertion (likely lack permissions, but trying to continue).",
      );
    }

    // Insert profile, overcoming FK if auth.users insert succeeded or if we bypassed it
    await client.query(
      `
      INSERT INTO public.profiles (id, role, status, first_name, last_name)
      VALUES ($1, 'admin', 'active', 'System', 'Admin')
      ON CONFLICT DO NOTHING;
    `,
      [mockUserId],
    );

    await client.query(
      `
      INSERT INTO public.stores (id, owner_id, name)
      VALUES ($1, $2, 'Ocluxx')
      ON CONFLICT DO NOTHING;
    `,
      [mockStoreId, mockUserId],
    );

    console.log(`   - Setup Mock Profile and Store.`);

    // Products
    const catRes = await client.query("SELECT id, slug FROM public.categories");
    const brandRes = await client.query("SELECT id, slug FROM public.brands");

    const catMap = {};
    catRes.rows.forEach((r) => (catMap[r.slug] = r.id));

    const brandMap = {};
    brandRes.rows.forEach((r) => (brandMap[r.slug] = r.id));

    for (const prod of seedData.products) {
      const catId = catMap[prod.category_slug];
      const brandId = brandMap[prod.brand_slug];

      if (!catId || !brandId) {
        console.warn(
          `   ⚠️ Skipping product "${prod.title}": Category or Brand not found.`,
        );
        continue;
      }

      await client.query(
        `INSERT INTO public.products (
           store_id, title, slug, price_usd, stock, sku, images, description, 
           category_id, brand_id
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (slug) DO UPDATE SET 
           price_usd = EXCLUDED.price_usd, 
           stock = EXCLUDED.stock`,
        [
          mockStoreId,
          prod.title,
          prod.slug,
          prod.price_usd,
          prod.stock,
          prod.sku,
          prod.images,
          prod.description,
          catId,
          brandId,
        ],
      );
    }
    console.log(`   - Inserted/Updated ${seedData.products.length} Products.`);

    console.log("✨ Database Setup Complete!");
  } catch (err) {
    console.error("❌ Error during setup:", err);
  } finally {
    await client.end();
  }
}

setupDatabase();
