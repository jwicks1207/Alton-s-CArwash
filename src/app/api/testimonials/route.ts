import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  name: z.string().min(2).max(80),
  quote: z.string().min(10).max(1000),
  rating: z.number().int().min(1).max(5),
});

export async function GET() {
  const testimonials = await prisma.testimonial.findMany({
    where: { status: "APPROVED" },
    orderBy: [{ createdAt: "desc" }],
    select: {
      id: true,
      name: true,
      quote: true,
      rating: true,
      createdAt: true,
    },
  });

  return NextResponse.json(testimonials);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = createSchema.parse(body);

    const testimonial = await prisma.testimonial.create({
      data: {
        name: data.name.trim(),
        quote: data.quote.trim(),
        rating: data.rating,
        status: "PENDING",
      },
      select: {
        id: true,
        name: true,
        quote: true,
        rating: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json(testimonial, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Please check your name, rating, and review text." },
        { status: 400 }
      );
    }
    console.error(error);
    return NextResponse.json({ error: "Could not save review" }, { status: 500 });
  }
}
