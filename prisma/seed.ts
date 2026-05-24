import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL || "admin@altonscarwash.com")
    .trim()
    .toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "changeme123";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: { email, passwordHash, name: "Admin" },
    });
    console.log(`Created admin user: ${email}`);
    console.log("Default password: changeme123 (change after first login)");
  }

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {},
  });

  const testimonialCount = await prisma.testimonial.count();
  if (testimonialCount === 0) {
    await prisma.testimonial.createMany({
      data: [
        {
          name: "Marcus T.",
          quote:
            "Best wash in town. My SUV looks brand new every time. Fast, friendly, and fair prices.",
          rating: 5,
          status: "APPROVED",
          sortOrder: 0,
        },
        {
          name: "Sarah L.",
          quote:
            "I bring my sedan here every two weeks. Consistent quality and they never miss the details.",
          rating: 5,
          status: "APPROVED",
          sortOrder: 1,
        },
        {
          name: "David R.",
          quote:
            "Booked online in minutes. They confirmed quickly and my coupe was spotless.",
          rating: 5,
          status: "APPROVED",
          sortOrder: 2,
        },
      ],
    });
  }

  const galleryCount = await prisma.galleryImage.count();
  if (galleryCount === 0) {
    await prisma.galleryImage.createMany({
      data: [
        {
          url: "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=800&q=80",
          caption: "Express exterior wash",
          sortOrder: 0,
        },
        {
          url: "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800&q=80",
          caption: "Premium detailing finish",
          sortOrder: 1,
        },
        {
          url: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&q=80",
          caption: "Interior deep clean",
          sortOrder: 2,
        },
        {
          url: "https://images.unsplash.com/photo-1507136566626-40b128d42e20?w=800&q=80",
          caption: "Tire shine & finish",
          sortOrder: 3,
        },
      ],
    });
  }

  console.log("Seed completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
