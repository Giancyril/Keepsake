import { db } from "../lib/db/client";
import { users } from "../lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function main() {
  const email = process.argv[2] || "admin@photovault.local";
  const password = process.argv[3] || "password123";
  const name = process.argv[4] || "Vault Owner";

  console.log(`\nCreating account for: ${email}...`);

  try {
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (existing) {
      console.log(`Account with email ${email} already exists!`);
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const [user] = await db
      .insert(users)
      .values({
        email: email.toLowerCase(),
        name,
        passwordHash,
      })
      .returning({ id: users.id, email: users.email, name: users.name });

    console.log(`\n Account created successfully!`);
    console.log(` Email:    ${user.email}`);
    console.log(` Password: ${password}`);
    console.log(` Name:     ${user.name}\n`);
    process.exit(0);
  } catch (err: any) {
    console.error(`\n Failed to create account in PostgreSQL:`, err.message || err);
    console.log(`\nNote: Ensure your DATABASE_URL in .env is configured and PostgreSQL is running.`);
    process.exit(1);
  }
}

main();
