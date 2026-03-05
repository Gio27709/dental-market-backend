import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { Client } from "pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const DB_CONNECTION_STRING =
  "postgresql://postgres.upzodyuuikrwosliscgy:Giovany123.@aws-1-us-east-1.pooler.supabase.com:5432/postgres";

const client = new Client({
  connectionString: DB_CONNECTION_STRING,
  ssl: { rejectUnauthorized: false },
});

const sql = `
-- Add full_name column to public.users if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'users' 
                   AND column_name = 'full_name') THEN
        ALTER TABLE public.users ADD COLUMN full_name TEXT;
    END IF;
END $$;

-- Update the trigger function to capture full_name from auth.users metadata during registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $BODY$
BEGIN
  INSERT INTO public.users (id, email, full_name, role_id)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    (SELECT id FROM public.roles WHERE name = COALESCE(new.raw_user_meta_data->>'role', 'buyer'))
  );
  RETURN new;
END;
$BODY$;
`;

async function applySQL() {
  try {
    console.log("Conectando a la base de datos PostgreSQL de Supabase...");
    await client.connect();

    console.log("Aplicando la migración SQL (Columna full_name y Trigger)...");
    await client.query(sql);

    console.log("✅ SQL ejecutado con éxito.");

    // Now trigger the other script to backfill data
    console.log(
      "\nA continuación, se ejecutarán los backfills de datos. Llama a 'node scripts/apply_migration_007.js' ahora.",
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Error ejecutando SQL:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

applySQL();
