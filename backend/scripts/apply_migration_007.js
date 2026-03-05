import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env") });
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Faltan variables de entorno necesarias (URL o ROLE KEY).");
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function backfillNames() {
  try {
    console.log("Backfilling (rellenando) nombres de usuarios existentes...");

    // Obtener todos los usuarios de Auth
    const {
      data: { users },
      error: authErr,
    } = await supabaseAdmin.auth.admin.listUsers();

    if (authErr) throw authErr;

    let updatedCount = 0;
    for (const user of users) {
      if (user.user_metadata?.full_name) {
        // Actualizar el registro correspondiente en public.users
        const { error: updateErr } = await supabaseAdmin
          .from("users")
          .update({ full_name: user.user_metadata.full_name })
          .eq("id", user.id);

        if (!updateErr) {
          updatedCount++;
        } else {
          console.warn(
            `No se pudo actualizar ${user.email}:`,
            updateErr.message,
          );
        }
      }
    }

    console.log(
      `✅ Se actualizaron los nombres de ${updatedCount} usuarios existentes.`,
    );
    process.exit(0);
  } catch (error) {
    console.error("❌ Error en backfill:", error);
    process.exit(1);
  }
}

backfillNames();
