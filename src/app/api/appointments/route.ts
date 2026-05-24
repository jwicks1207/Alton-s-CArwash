import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getNotificationSettings } from "@/lib/settings";
import { sendAppointmentEmail } from "@/lib/email";
import { CAR_TYPES, TIME_SLOTS } from "@/lib/appointments";
import { validateMobileBooking } from "@/lib/booking-validation";
import { normalizeZipCode } from "@/lib/zipcodes";

const schema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().min(7).max(20),
  carType: z.enum(CAR_TYPES as unknown as [string, ...string[]]),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.enum(TIME_SLOTS as unknown as [string, ...string[]]),
  comments: z.string().max(1000).optional(),
  isMobile: z.boolean().optional().default(false),
  address: z.string().max(300).optional().default(""),
  zipCode: z.string().max(10).optional().default(""),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = schema.parse(body);

    const settings = await getNotificationSettings();
    if (!settings) {
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }

    const mobileCheck = validateMobileBooking(settings, {
      isMobile: data.isMobile,
      address: data.address || "",
      zipCode: data.zipCode || "",
    });

    if (!mobileCheck.ok) {
      return NextResponse.json(
        { error: mobileCheck.error },
        { status: 400 }
      );
    }

    const appointment = await prisma.appointment.create({
      data: {
        name: data.name,
        phone: data.phone,
        carType: data.carType,
        date: data.date,
        time: data.time,
        comments: data.comments || "",
        isMobile: data.isMobile,
        address: data.isMobile ? data.address!.trim() : "",
        zipCode: data.isMobile ? normalizeZipCode(data.zipCode!) : "",
        status: "BOOKED",
        source: "ONLINE",
      },
    });

    await sendAppointmentEmail(settings, {
      name: data.name,
      phone: data.phone,
      carType: data.carType,
      date: data.date,
      time: data.time,
      comments: data.comments || "",
      source: "Online booking",
      isMobile: data.isMobile,
      address: data.isMobile ? data.address!.trim() : "",
      zipCode: data.isMobile ? normalizeZipCode(data.zipCode!) : "",
    });

    return NextResponse.json({ ok: true, id: appointment.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid form data", details: error.flatten() },
        { status: 400 }
      );
    }
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
