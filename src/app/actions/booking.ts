"use server";

import { Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";

export type CreateBookingInput = {
  serviceId: string;
  serviceName: string;
  price: number;
  date: string;
  timeSlot: string;
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
        serviceName: input.serviceName,
        price: input.price,
        date: input.date,
        timeSlot: input.timeSlot,
      },
    });

    return { ok: true, id: booking.id };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false, error: "Η ώρα αυτή είναι ήδη κλεισμένη." };
    }

    console.error("Failed to create booking:", error);
    return { ok: false, error: "Αποτυχία αποθήκευσης κράτησης. Δοκιμάστε ξανά." };
  }
}

export async function getBookedTimeSlots(date: string): Promise<string[]> {
  try {
    const prisma = getPrisma();

    const bookings = await prisma.booking.findMany({
      where: { date },
      select: { timeSlot: true },
    });

    return bookings.map((booking) => booking.timeSlot);
  } catch (error) {
    console.error("Failed to load booked time slots:", error);
    return [];
  }
}
