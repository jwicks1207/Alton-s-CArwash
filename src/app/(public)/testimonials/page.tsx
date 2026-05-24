import { prisma } from "@/lib/prisma";
import { getSiteContent } from "@/lib/settings";
import { TestimonialsPageContent } from "@/components/TestimonialsPageContent";

/** Always load fresh approved reviews from the database (avoids stale static snapshot). */
export const dynamic = "force-dynamic";

export default async function TestimonialsPage() {
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
