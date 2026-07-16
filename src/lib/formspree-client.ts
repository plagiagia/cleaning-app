export const FORMSPREE_FORM_ID =
  process.env.NEXT_PUBLIC_FORMSPREE_FORM_ID ?? "xpqvqvel";

export type FormspreeBookingPayload = {
  bookingId: string;
  serviceName: string;
  dateLabel: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  latitude: number;
  longitude: number;
  photosCount: number;
};

export type FormspreeSubmitResult = { ok: true } | { ok: false; error: string };

export async function submitBookingToFormspree(
  payload: FormspreeBookingPayload,
): Promise<FormspreeSubmitResult> {
  const mapLink = `https://www.google.com/maps?q=${payload.latitude},${payload.longitude}`;
  const message = [
    `Booking ID: ${payload.bookingId}`,
    `Service: ${payload.serviceName}`,
    `Date: ${payload.dateLabel}`,
    `Name: ${payload.firstName} ${payload.lastName}`,
    `Phone: ${payload.phone}`,
    `Email: ${payload.email}`,
    `Location: ${payload.latitude.toFixed(6)}, ${payload.longitude.toFixed(6)}`,
    `Map: ${mapLink}`,
    `Photos: ${payload.photosCount}`,
  ].join("\n");

  try {
    const response = await fetch(`https://formspree.io/f/${FORMSPREE_FORM_ID}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        _subject: `New booking: ${payload.serviceName} — ${payload.dateLabel}`,
        _replyto: payload.email,
        booking_id: payload.bookingId,
        service: payload.serviceName,
        date: payload.dateLabel,
        first_name: payload.firstName,
        last_name: payload.lastName,
        name: `${payload.firstName} ${payload.lastName}`,
        phone: payload.phone,
        email: payload.email,
        location: `${payload.latitude.toFixed(6)}, ${payload.longitude.toFixed(6)}`,
        map_link: mapLink,
        photos_count: payload.photosCount,
        message,
      }),
    });

    const result = (await response.json()) as { ok?: boolean; error?: string };

    if (!response.ok || result.ok === false) {
      return {
        ok: false,
        error: result.error ?? "Formspree failed to send the booking email.",
      };
    }

    return { ok: true };
  } catch (error) {
    console.error("Formspree client error:", error);
    return { ok: false, error: "Failed to send booking email." };
  }
}
