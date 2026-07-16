"use server";

import { getPrisma } from "@/lib/prisma";
import { sendBookingEmails, type BookingEmailPhoto } from "@/lib/email";
import { translateService } from "@/lib/i18n/translate-service";

export type BookingPhotoInput = BookingEmailPhoto;

export type CreateBookingInput = {
  serviceId: string;
  date: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  comments?: string;
  latitude: number;
  longitude: number;
  photos?: BookingPhotoInput[];
  locale?: string;
  dateLabel?: string;
};

export type CreateBookingResult =
  | { ok: true; id: string; emailSent: boolean }
  | { ok: false; error: string };

const MAX_PHOTOS = 5;
const MAX_PHOTO_SIZE_BYTES = 4 * 1024 * 1024;

function validateInput(input: CreateBookingInput): string | null {
  if (!input.serviceId?.trim()) {
    return "Missing service.";
  }
  if (!input.date?.trim()) {
    return "Missing date.";
  }
  if (!input.firstName?.trim() || !input.lastName?.trim()) {
    return "Name is required.";
  }
  if (!input.phone?.trim()) {
    return "Phone is required.";
  }
  if (!input.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) {
    return "Valid email is required.";
  }
  if (!input.address?.trim()) {
    return "Address is required.";
  }
  if (
    typeof input.latitude !== "number" ||
    typeof input.longitude !== "number" ||
    Number.isNaN(input.latitude) ||
    Number.isNaN(input.longitude)
  ) {
    return "Location is required.";
  }

  const photos = input.photos ?? [];
  if (photos.length > MAX_PHOTOS) {
    return "Too many photos.";
  }

  for (const photo of photos) {
    if (!photo.type.startsWith("image/")) {
      return "Invalid photo type.";
    }
    const sizeBytes = Buffer.byteLength(photo.data, "base64");
    if (sizeBytes > MAX_PHOTO_SIZE_BYTES) {
      return "Photo too large.";
    }
  }

  return null;
}

export async function createBooking(input: CreateBookingInput): Promise<CreateBookingResult> {
  const validationError = validateInput(input);
  if (validationError) {
    return { ok: false, error: validationError };
  }

  try {
    const prisma = getPrisma();
    const photos = input.photos ?? [];

    const service = await prisma.service.findUnique({
      where: { id: input.serviceId },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        emoji: true,
      },
    });

    if (!service) {
      return { ok: false, error: "Service not found." };
    }

    const greekService = translateService(service, "el");

    const booking = await prisma.booking.create({
      data: {
        serviceId: input.serviceId,
        date: input.date,
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        phone: input.phone.trim(),
        email: input.email.trim(),
        address: input.address.trim(),
        comments: input.comments?.trim() || null,
        latitude: input.latitude,
        longitude: input.longitude,
        photos: photos.length > 0 ? photos : undefined,
      },
    });

    const emailResult = await sendBookingEmails({
      bookingId: booking.id,
      serviceName: greekService.name,
      date: input.dateLabel ?? input.date,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      phone: input.phone.trim(),
      email: input.email.trim(),
      address: input.address.trim(),
      comments: input.comments?.trim() || null,
      latitude: input.latitude,
      longitude: input.longitude,
      photos,
      locale: input.locale ?? "el",
    });

    if (!emailResult.ok) {
      console.error("Booking saved but email failed:", emailResult.error);
    }

    return { ok: true, id: booking.id, emailSent: emailResult.ok };
  } catch (error) {
    console.error("Failed to create booking:", error);
    return { ok: false, error: "Αποτυχία αποθήκευσης κράτησης. Δοκιμάστε ξανά." };
  }
}
