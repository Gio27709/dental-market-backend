import fs from "fs";
import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Client } = pg;

async function runSafeMigration() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("No DATABASE_URL found in .env");
    process.exit(1);
  }

  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log("Connected to Supabase DB for safe migration...");

    // 1. Rename existing tables to avoid conflict and keep data
    console.log("Renaming existing tables to legacy_...");
    await client.query(`
      DO $$ 
      BEGIN
        IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'stores') THEN
          ALTER TABLE public.stores RENAME TO legacy_stores;
        END IF;
        
        IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'products') THEN
          ALTER TABLE public.products RENAME TO legacy_products;
        END IF;

        IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'orders') THEN
          ALTER TABLE public.orders RENAME TO legacy_orders;
        END IF;
        
        IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'order_items') THEN
          ALTER TABLE public.order_items RENAME TO legacy_order_items;
        END IF;
        
        IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
          ALTER TABLE public.profiles RENAME TO legacy_profiles;
        END IF;

        IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
          ALTER TABLE public.users RENAME TO legacy_users;
        END IF;
      END $$;
    `);

    // 2. Run the main migration script to create new schema
    console.log("Applying new schema (Fase 1)...");
    const sql = fs.readFileSync(
      "supabase/migrations/20260224150000_init_dentalmarket.sql",
      "utf8",
    );
    await client.query(sql);

    // 3. Port data from legacy_products to new products
    console.log("Porting existing data to new schema...");

    // We need to port Users first (owner of stores)
    await client.query(`
      INSERT INTO public.users (id, email, is_verified, is_active)
      SELECT p.id, au.email, true, true
      FROM public.legacy_profiles p
      JOIN auth.users au ON au.id = p.id
      ON CONFLICT (id) DO NOTHING;
    `);

    // Port Stores
    await client.query(`
      INSERT INTO public.store_profiles (user_id, business_name, rating_avg, is_verified)
      SELECT owner_id, name, reputation, true
      FROM public.legacy_stores
      WHERE owner_id IN (SELECT id FROM public.users)
      ON CONFLICT (user_id) DO NOTHING;
    `);

    // Make sure fake store exists if some products lack a valid store owner
    const fakeStoreIdRes = await client.query(`
      SELECT user_id FROM public.store_profiles LIMIT 1;
    `);

    let fallbackStoreId = null;
    if (fakeStoreIdRes.rows.length > 0) {
      fallbackStoreId = fakeStoreIdRes.rows[0].user_id;
    } else {
      // If no store exists, find an admin or user and make them a store to own legacy products
      const adminRes = await client.query(
        `SELECT id FROM public.users LIMIT 1;`,
      );
      if (adminRes.rows.length > 0) {
        fallbackStoreId = adminRes.rows[0].id;
        await client.query(
          `
                INSERT INTO public.store_profiles (user_id, business_name, is_verified)
                VALUES ($1, 'Legacy Store', true)
                ON CONFLICT DO NOTHING;
            `,
          [fallbackStoreId],
        );
      }
    }

    if (fallbackStoreId) {
      // Port Products. We map price_usd into price.
      await client.query(
        `
          INSERT INTO public.products (id, store_id, name, description, price, stock, moderation_status, is_active)
          SELECT id, COALESCE((SELECT user_id FROM public.store_profiles WHERE user_id = (SELECT owner_id FROM public.legacy_stores WHERE id = store_id)), $1), title, description, price_usd, stock, 'approved', is_active
          FROM public.legacy_products
          ON CONFLICT (id) DO NOTHING;
        `,
        [fallbackStoreId],
      );

      // Fix images from text[] to jsonb
      await client.query(`
            UPDATE public.products p
            SET images = array_to_json(lp.images)::jsonb
            FROM public.legacy_products lp
            WHERE p.id = lp.id AND lp.images IS NOT NULL;
        `);
    }

    // Done!
    console.log("Migration and Data Porting successfully applied!");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await client.end();
  }
}

runSafeMigration();
