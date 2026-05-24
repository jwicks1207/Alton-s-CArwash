import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL || "admin@altonscarwash.com")
    .trim()
    .toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    console.error("ERROR: Set ADMIN_PASSWORD (and optionally ADMIN_EMAIL).");
    console.error(
      'Example: ADMIN_EMAIL="you@example.com" ADMIN_PASSWORD="YourNewPass123" npm run reset-admin'
    );
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, name: "Admin" },
    create: { email, passwordHash, name: "Admin" },
  });

  const allUsers = await prisma.user.findMany({
    select: { email: true },
  });

  console.log(`Admin password updated for: ${user.email}`);
  if (allUsers.length > 1) {
    console.log("Other users in database:", allUsers.map((u) => u.email).join(", "));
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
