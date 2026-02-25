import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Client } = pg;

async function seedDentalData() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("No DATABASE_URL found in .env");
    process.exit(1);
  }

  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log("Connected to DB for Cleaning and Seeding...");

    // Removed schema patching as it already executed successfully.

    await client.query("BEGIN");
    console.log("Cleaning up electronic test data...");
    const resultDelete = await client.query(`
      DELETE FROM public.products
      WHERE name ILIKE ANY (ARRAY['%iphone%', '%samsung%', '%sony%', '%dji%', '%macbook%', '%tv%', '%smart tv%', '%watch%', '%gaming%'])
      OR category_id IN (
          SELECT id FROM public.categories 
          WHERE slug IN ('laptops', 'smartphones', 'cameras', 'headphones', 'pc-gaming', 'tablets', 'television', 'watches', 'speakers')
      )
      RETURNING id, name;
    `);
    console.log(`Deleted ${resultDelete.rowCount} non-dental products.`);

    // 3. Delete non-dental categories completely to cleanse the site
    await client.query(`
      DELETE FROM public.categories 
      WHERE slug IN ('laptops', 'smartphones', 'cameras', 'headphones', 'pc-gaming', 'tablets', 'television', 'watches', 'speakers')
    `);

    // 2. Fetch a store_id to assign these new products
    console.log("Fetching a valid store profile...");
    const storeRes = await client.query(
      "SELECT user_id FROM public.store_profiles LIMIT 1",
    );
    if (storeRes.rows.length === 0) {
      throw new Error(
        "No store profiles exist to map products to. Ensure at least one store exists runing Phase 1.",
      );
    }
    const storeId = storeRes.rows[0].user_id;

    // 3. Create Basic Dental Categories
    const categories = [
      { name: "Resinas y Composites", slug: "resinas-composites" },
      { name: "Anestesia", slug: "anestesia" },
      { name: "Descartables", slug: "descartables" },
      { name: "Instrumental", slug: "instrumental" },
    ];

    const categoryMap = {};
    for (const cat of categories) {
      const catRes = await client.query(
        `
        INSERT INTO public.categories (name, slug)
        VALUES ($1, $2)
        ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
        RETURNING id;
      `,
        [cat.name, cat.slug],
      );
      categoryMap[cat.slug] = catRes.rows[0].id;
    }

    // 4. Create Dental Products & Variations
    const dentalProducts = [
      {
        name: "Resina Compuesta Filtek Z350 XT",
        slug: "resina-filtek-z350-xt",
        description: "Resina nanoparticulada de alto rendimiento estético.",
        price: 35.0,
        categoryUrl: "resinas-composites",
        images: ["https://placehold.co/400x400/9b59b6/ffffff?text=Filtek+Z350"],
        variations: [
          {
            attribute_name: "Tono",
            attribute_value: "A1",
            stock: 15,
            price_modifier: 0,
          },
          {
            attribute_name: "Tono",
            attribute_value: "A2",
            stock: 20,
            price_modifier: 0,
          },
          {
            attribute_name: "Tono",
            attribute_value: "B1",
            stock: 10,
            price_modifier: 0,
          },
        ],
      },
      {
        name: "Anestésico Lidocaína 2% con Epinefrina",
        slug: "lidocaina-epinefrina",
        description: "Anestésico local inyectable. Larga duración.",
        price: 25.5,
        categoryUrl: "anestesia",
        images: ["https://placehold.co/400x400/3498db/ffffff?text=Lidocaina"],
        variations: [
          {
            attribute_name: "Presentación",
            attribute_value: "Caja x 50 cartuchos",
            stock: 50,
            price_modifier: 0,
          },
          {
            attribute_name: "Presentación",
            attribute_value: "Caja x 100 cartuchos",
            stock: 30,
            price_modifier: 20.0,
          },
        ],
      },
      {
        name: "Guantes de Nitrilo (Caja 100und)",
        slug: "guantes-nitrilo",
        description: "Guantes descartables, libres de polvo.",
        price: 8.5,
        categoryUrl: "descartables",
        images: ["https://placehold.co/400x400/1abc9c/ffffff?text=Guantes"],
        variations: [
          {
            attribute_name: "Talla",
            attribute_value: "S",
            stock: 100,
            price_modifier: 0,
          },
          {
            attribute_name: "Talla",
            attribute_value: "M",
            stock: 150,
            price_modifier: 0,
          },
          {
            attribute_name: "Talla",
            attribute_value: "L",
            stock: 80,
            price_modifier: 0,
          },
          {
            attribute_name: "Talla",
            attribute_value: "XL",
            stock: 20,
            price_modifier: 0,
          },
        ],
      },
      {
        name: "Mascarillas Descartables Triple Capa",
        slug: "mascarillas-triple-capa",
        description: "Mascarillas quirúrgicas con elástico.",
        price: 5.0,
        categoryUrl: "descartables",
        images: ["https://placehold.co/400x400/f1c40f/ffffff?text=Mascarillas"],
        variations: [
          {
            attribute_name: "Presentación",
            attribute_value: "Caja x 50",
            stock: 200,
            price_modifier: 0,
          },
          {
            attribute_name: "Presentación",
            attribute_value: "Bulto x 1000",
            stock: 10,
            price_modifier: 75.0,
          },
        ],
      },
      {
        name: "Ácido Grabador Fosfórico 37%",
        slug: "acido-grabador",
        description: "Gel para grabado de esmalte y dentina.",
        price: 12.0,
        categoryUrl: "resinas-composites",
        images: ["https://placehold.co/400x400/e74c3c/ffffff?text=Acido"],
        variations: [
          {
            attribute_name: "Presentación",
            attribute_value: "Jeringa 3g",
            stock: 45,
            price_modifier: 0,
          },
          {
            attribute_name: "Presentación",
            attribute_value: "Frasco 10ml",
            stock: 15,
            price_modifier: 8.0,
          },
        ],
      },
    ];

    console.log("Inserting Dental Products and Variations...");
    for (const prod of dentalProducts) {
      // Insert Product
      const pRes = await client.query(
        `
        INSERT INTO public.products (store_id, category_id, name, slug, description, price, moderation_status, images)
        VALUES ($1, $2, $3, $4, $5, $6, 'approved', $7::jsonb)
        RETURNING id;
      `,
        [
          storeId,
          categoryMap[prod.categoryUrl],
          prod.name,
          prod.slug,
          prod.description,
          prod.price,
          JSON.stringify(prod.images),
        ],
      );

      const productId = pRes.rows[0].id;

      // Insert Variations
      for (const v of prod.variations) {
        await client.query(
          `
          INSERT INTO public.product_variations (product_id, attribute_name, attribute_value, stock, price_modifier)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT DO NOTHING;
        `,
          [
            productId,
            v.attribute_name,
            v.attribute_value,
            v.stock,
            v.price_modifier,
          ],
        );
      }
    }

    await client.query("COMMIT");
    console.log("Seed and Cleanup completed successfully!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Seed/Cleanup failed:", err);
  } finally {
    await client.end();
  }
}

seedDentalData();
