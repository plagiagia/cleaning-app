import { Resend } from "resend";

const COMPANY_EMAIL = process.env.COMPANY_EMAIL ?? "s.cleaning2025@yahoo.com";
const FROM_EMAIL = process.env.FROM_EMAIL ?? "S.cleaning <onboarding@resend.dev>";

export type BookingEmailPhoto = {
  name: string;
  type: string;
  data: string;
};

export type BookingEmailDetails = {
  bookingId: string;
  serviceName: string;
  date: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  latitude: number;
  longitude: number;
  photos: BookingEmailPhoto[];
  locale: string;
};

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new Resend(apiKey);
}

function formatMapLink(latitude: number, longitude: number) {
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
}

function buildPhotoAttachments(photos: BookingEmailPhoto[]) {
  return photos.map((photo) => ({
    filename: photo.name,
    content: Buffer.from(photo.data, "base64"),
    contentType: photo.type,
  }));
}

function buildBookingSummary(details: BookingEmailDetails) {
  const mapLink = formatMapLink(details.latitude, details.longitude);

  return `
    <h2>New booking #${details.bookingId}</h2>
    <p><strong>Service:</strong> ${details.serviceName}</p>
    <p><strong>Date:</strong> ${details.date}</p>
    <p><strong>Name:</strong> ${details.firstName} ${details.lastName}</p>
    <p><strong>Phone:</strong> ${details.phone}</p>
    <p><strong>Email:</strong> ${details.email}</p>
    <p><strong>Location:</strong> <a href="${mapLink}">${details.latitude.toFixed(6)}, ${details.longitude.toFixed(6)}</a></p>
    <p><strong>Photos attached:</strong> ${details.photos.length}</p>
  `;
}

const confirmationSubjects: Record<string, string> = {
  el: "Η κράτησή σας ελήφθη — S.cleaning",
  en: "Your booking was received — S.cleaning",
  bg: "Вашата резервация е получена — S.cleaning",
  mk: "Вашата резервација е примена — S.cleaning",
  sr: "Vaša rezervacija je primljena — S.cleaning",
};

const confirmationBodies: Record<string, (details: BookingEmailDetails) => string> = {
  el: (details) => `
    <p>Αγαπητέ/ή ${details.firstName},</p>
    <p>Λάβαμε την κράτησή σας για <strong>${details.serviceName}</strong> στις <strong>${details.date}</strong>.</p>
    <p>Θα επικοινωνήσουμε μαζί σας σύντομα για τις λεπτομέρειες.</p>
    <p>Ευχαριστούμε,<br/>S.cleaning</p>
  `,
  en: (details) => `
    <p>Dear ${details.firstName},</p>
    <p>We have received your booking for <strong>${details.serviceName}</strong> on <strong>${details.date}</strong>.</p>
    <p>We will contact you shortly with the details.</p>
    <p>Thank you,<br/>S.cleaning</p>
  `,
  bg: (details) => `
    <p>Здравейте ${details.firstName},</p>
    <p>Получихме вашата резервация за <strong>${details.serviceName}</strong> на <strong>${details.date}</strong>.</p>
    <p>Ще се свържем с вас скоро за подробностите.</p>
    <p>Благодарим ви,<br/>S.cleaning</p>
  `,
  mk: (details) => `
    <p>Почитуван/а ${details.firstName},</p>
    <p>Ја примивме вашата резервација за <strong>${details.serviceName}</strong> на <strong>${details.date}</strong>.</p>
    <p>Ќе ве контактираме наскоро за деталите.</p>
    <p>Ви благодариме,<br/>S.cleaning</p>
  `,
  sr: (details) => `
    <p>Poštovani/a ${details.firstName},</p>
    <p>Primili smo vašu rezervaciju za <strong>${details.serviceName}</strong> za <strong>${details.date}</strong>.</p>
    <p>Kontaktiraćemo vas uskoro za detalje.</p>
    <p>Hvala vam,<br/>S.cleaning</p>
  `,
};

export type SendBookingEmailsResult =
  | { ok: true }
  | { ok: false; error: string };

export async function sendBookingEmails(
  details: BookingEmailDetails,
): Promise<SendBookingEmailsResult> {
  const resend = getResendClient();
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping booking emails");
    return { ok: true };
  }

  const attachments = buildPhotoAttachments(details.photos);
  const locale = details.locale in confirmationSubjects ? details.locale : "el";
  const confirmationSubject = confirmationSubjects[locale];
  const confirmationBody = confirmationBodies[locale](details);

  try {
    const companyResult = await resend.emails.send({
      from: FROM_EMAIL,
      to: COMPANY_EMAIL,
      replyTo: details.email,
      subject: `New booking: ${details.serviceName} — ${details.date}`,
      html: buildBookingSummary(details),
      attachments: attachments.length > 0 ? attachments : undefined,
    });

    if (companyResult.error) {
      console.error("Failed to send company email:", companyResult.error);
      return { ok: false, error: "Failed to send notification email." };
    }

    const customerResult = await resend.emails.send({
      from: FROM_EMAIL,
      to: details.email,
      subject: confirmationSubject,
      html: confirmationBody,
    });

    if (customerResult.error) {
      console.error("Failed to send customer email:", customerResult.error);
      return { ok: false, error: "Failed to send confirmation email." };
    }

    return { ok: true };
  } catch (error) {
    console.error("Email send error:", error);
    return { ok: false, error: "Failed to send emails." };
  }
}
