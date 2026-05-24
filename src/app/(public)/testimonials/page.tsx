import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSiteContent } from "@/lib/settings";
import { TestimonialsPageContent } from "@/components/TestimonialsPageContent";

export default async function TestimonialsPage() {
  noStore();
  const content = await getSiteContent();
  const testimonials = await prisma.testimonial.findMany({
    where: { status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      quote: true,
      rating: true,
      createdAt: true,
    },
  });

  const initialTestimonials = testimonials.map((t) => ({
    ...t,
    createdAt: t.createdAt.toISOString(),
  }));

  return (
    <TestimonialsPageContent
      businessName={content.businessName}
      initialTestimonials={initialTestimonials}
    />
  );
}
