"use server";

import { getPrisma } from "@/lib/prisma";

export type CreateBookingInput = {
  serviceId: string;
  date: string;
};

export type CreateBookingResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export async function createBooking(input: CreateBookingInput): Promise<CreateBookingResult> {
  try {
    const prisma = getPrisma();

    const booking = await prisma.booking.create({
      data: {
        serviceId: input.serviceId,
        date: input.date,
      },
    });

    return { ok: true, id: booking.id };
  } catch (error) {
    console.error("Failed to create booking:", error);
    return { ok: false, error: "Αποτυχία αποθήκευσης κράτησης. Δοκιμάστε ξανά." };
  }
}
