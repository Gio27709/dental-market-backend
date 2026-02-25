import dotenv from "dotenv";
dotenv.config();

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "Faltan variables de entorno SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env",
  );
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function setupLicensesBucket() {
  console.log("Verificando/Creando el bucket 'licenses' como PRIVADO...");

  try {
    // Verificar si el bucket ya existe
    const { data: buckets, error: listError } =
      await supabaseAdmin.storage.listBuckets();

    if (listError) throw listError;

    const licensesBucket = buckets.find((b) => b.name === "licenses");

    if (licensesBucket) {
      console.log("El bucket 'licenses' ya existe.");
      if (licensesBucket.public) {
        console.log("El bucket es PÚBLICO. Cambiándolo a PRIVADO...");
        const { error: updateError } = await supabaseAdmin.storage.updateBucket(
          "licenses",
          {
            public: false,
          },
        );
        if (updateError) throw updateError;
        console.log("✅ Bucket 'licenses' actualizado a PRIVADO.");
      } else {
        console.log("✅ Bucket 'licenses' ya está configurado como PRIVADO.");
      }
    } else {
      console.log("Creando el bucket 'licenses'...");
      const { error: createError } = await supabaseAdmin.storage.createBucket(
        "licenses",
        {
          public: false,
          fileSizeLimit: 5242880, // 5MB
          allowedMimeTypes: ["image/png", "image/jpeg", "application/pdf"],
        },
      );

      if (createError) throw createError;
      console.log("✅ Bucket 'licenses' creado exitosamente y es PRIVADO.");
    }
  } catch (error) {
    console.error("Error configurando el bucket:", error);
  }
}

setupLicensesBucket();
