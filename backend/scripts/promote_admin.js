import pkg from "pg";
import { fileURLToPath } from "url";

const { Client } = pkg;

// ============================================
// Script: Promote a user to Admin role
// Usage: node scripts/promote_admin.js <email>
// ============================================

const email = process.argv[2];

if (!email) {
  console.error("❌ Usage: node scripts/promote_admin.js <email>");
  console.error("   Example: node scripts/promote_admin.js admin@example.com");
  process.exit(1);
}

async function promoteToAdmin() {
  const dbUrl =
    "postgresql://postgres.upzodyuuikrwosliscgy:Giovany123.@aws-1-us-east-1.pooler.supabase.com:5432/postgres";

  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log(`Connecting to Supabase DB...`);
    await client.connect();

    // 1. Find the user by email
    const userResult = await client.query(
      `SELECT id FROM auth.users WHERE email = $1`,
      [email],
    );

    if (userResult.rows.length === 0) {
      console.error(`❌ User with email "${email}" not found in auth.users`);
      process.exit(1);
    }

    const userId = userResult.rows[0].id;
    console.log(`Found user: ${userId}`);

    // 2. Get the admin role_id
    const roleResult = await client.query(
      `SELECT id FROM public.roles WHERE name = 'admin'`,
    );

    if (roleResult.rows.length === 0) {
      console.error("❌ 'admin' role not found in roles table");
      process.exit(1);
    }

    const adminRoleId = roleResult.rows[0].id;

    // 3. Update user role in public.users table
    await client.query(`UPDATE public.users SET role_id = $1 WHERE id = $2`, [
      adminRoleId,
      userId,
    ]);

    // 4. Update user_metadata in auth.users to include admin role
    await client.query(
      `UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb WHERE id = $1`,
      [userId],
    );

    console.log(`✅ User "${email}" promoted to admin successfully!`);
    console.log(`   - public.users.role_id → admin`);
    console.log(`   - auth.users.raw_user_meta_data.role → "admin"`);
    console.log(
      `\n   The user needs to logout and login again for changes to take effect.`,
    );
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await client.end();
  }
}

promoteToAdmin();
