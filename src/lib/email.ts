import nodemailer from "nodemailer";
import { Resend } from "resend";

const COMPANY_EMAIL = process.env.COMPANY_EMAIL ?? "s.cleaning2025@yahoo.com";
const FROM_EMAIL =
  process.env.FROM_EMAIL ??
  process.env.SMTP_FROM ??
  `S.cleaning <${COMPANY_EMAIL}>`;

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

export type SendBookingEmailsResult =
  | { ok: true; provider: "web3forms" | "smtp" | "resend"; customerNotified: boolean }
  | { ok: false; error: string };

const confirmationSubjects: Record<string, string> = {
  el: "Η κράτησή σας ελήφθη — S.cleaning",
  en: "Your booking was received — S.cleaning",
  bg: "Вашата резервация е получена — S.cleaning",
  mk: "Вашата резервација е примена — S.cleaning",
  sr: "Vaša rezervacija je primljena — S.cleaning",
};

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

function buildBookingMessage(details: BookingEmailDetails) {
  const mapLink = formatMapLink(details.latitude, details.longitude);

  return [
    `Booking ID: ${details.bookingId}`,
    `Service: ${details.serviceName}`,
    `Date: ${details.date}`,
    `Name: ${details.firstName} ${details.lastName}`,
    `Phone: ${details.phone}`,
    `Email: ${details.email}`,
    `Location: ${details.latitude.toFixed(6)}, ${details.longitude.toFixed(6)}`,
    `Map: ${mapLink}`,
    `Photos: ${details.photos.length}`,
  ].join("\n");
}

function buildBookingSummaryHtml(details: BookingEmailDetails) {
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

function buildConfirmationBody(details: BookingEmailDetails) {
  const locale = details.locale in confirmationSubjects ? details.locale : "el";

  const bodies: Record<string, string> = {
    el: `
      <p>Αγαπητέ/ή ${details.firstName},</p>
      <p>Λάβαμε την κράτησή σας για <strong>${details.serviceName}</strong> στις <strong>${details.date}</strong>.</p>
      <p>Θα επικοινωνήσουμε μαζί σας σύντομα για τις λεπτομέρειες.</p>
      <p>Ευχαριστούμε,<br/>S.cleaning</p>
    `,
    en: `
      <p>Dear ${details.firstName},</p>
      <p>We have received your booking for <strong>${details.serviceName}</strong> on <strong>${details.date}</strong>.</p>
      <p>We will contact you shortly with the details.</p>
      <p>Thank you,<br/>S.cleaning</p>
    `,
    bg: `
      <p>Здравейте ${details.firstName},</p>
      <p>Получихме вашата резервация за <strong>${details.serviceName}</strong> на <strong>${details.date}</strong>.</p>
      <p>Ще се свържем с вас скоро за подробностите.</p>
      <p>Благодарим ви,<br/>S.cleaning</p>
    `,
    mk: `
      <p>Почитуван/а ${details.firstName},</p>
      <p>Ја примивме вашата резервација за <strong>${details.serviceName}</strong> на <strong>${details.date}</strong>.</p>
      <p>Ќе ве контактираме наскоро за деталите.</p>
      <p>Ви благодариме,<br/>S.cleaning</p>
    `,
    sr: `
      <p>Poštovani/a ${details.firstName},</p>
      <p>Primili smo vašu rezervaciju za <strong>${details.serviceName}</strong> za <strong>${details.date}</strong>.</p>
      <p>Kontaktiraćemo vas uskoro za detalje.</p>
      <p>Hvala vam,<br/>S.cleaning</p>
    `,
  };

  return {
    subject: confirmationSubjects[locale],
    html: bodies[locale],
  };
}

function getSmtpTransport() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  const port = Number(process.env.SMTP_PORT ?? 465);
  const secure = process.env.SMTP_SECURE !== "false";

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new Resend(apiKey);
}

function formatProviderError(error: unknown): string {
  if (error && typeof error === "object") {
    const record = error as Record<string, unknown>;
    if (typeof record.message === "string") {
      return record.message;
    }
    if (record.error && typeof record.error === "object") {
      const nested = record.error as Record<string, unknown>;
      if (typeof nested.message === "string") {
        return nested.message;
      }
    }
  }
  return "Unknown email error";
}

async function sendViaWeb3Forms(
  details: BookingEmailDetails,
): Promise<SendBookingEmailsResult> {
  const accessKey = process.env.WEB3FORMS_ACCESS_KEY;
  if (!accessKey) {
    return { ok: false, error: "Web3Forms is not configured." };
  }

  const mapLink = formatMapLink(details.latitude, details.longitude);

  try {
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: accessKey,
        subject: `New booking: ${details.serviceName} — ${details.date}`,
        from_name: "S.cleaning Website",
        name: `${details.firstName} ${details.lastName}`,
        email: details.email,
        phone: details.phone,
        service: details.serviceName,
        date: details.date,
        location: `${details.latitude.toFixed(6)}, ${details.longitude.toFixed(6)}`,
        map_link: mapLink,
        photos_count: String(details.photos.length),
        message: buildBookingMessage(details),
        botcheck: false,
      }),
    });

    const result = (await response.json()) as { success?: boolean; message?: string };

    if (!response.ok || !result.success) {
      console.error("Web3Forms error:", result);
      return {
        ok: false,
        error: result.message ?? "Web3Forms failed to send the booking email.",
      };
    }

    return { ok: true, provider: "web3forms", customerNotified: false };
  } catch (error) {
    console.error("Web3Forms send error:", error);
    return { ok: false, error: formatProviderError(error) };
  }
}

async function sendCustomerConfirmation(
  details: BookingEmailDetails,
): Promise<boolean> {
  const transport = getSmtpTransport();
  const confirmation = buildConfirmationBody(details);

  if (transport) {
    try {
      await transport.sendMail({
        from: FROM_EMAIL,
        to: details.email,
        subject: confirmation.subject,
        html: confirmation.html,
      });
      return true;
    } catch (error) {
      console.error("Customer confirmation via SMTP failed:", error);
    }
  }

  const resend = getResendClient();
  if (resend) {
    try {
      const customerResult = await resend.emails.send({
        from: FROM_EMAIL,
        to: details.email,
        subject: confirmation.subject,
        html: confirmation.html,
      });
      if (!customerResult.error) {
        return true;
      }
      console.error("Customer confirmation via Resend failed:", customerResult.error);
    } catch (error) {
      console.error("Customer confirmation via Resend failed:", error);
    }
  }

  return false;
}

async function sendViaSmtp(details: BookingEmailDetails): Promise<SendBookingEmailsResult> {
  const transport = getSmtpTransport();
  if (!transport) {
    return { ok: false, error: "SMTP is not configured." };
  }

  const attachments = buildPhotoAttachments(details.photos);
  const confirmation = buildConfirmationBody(details);

  try {
    await transport.sendMail({
      from: FROM_EMAIL,
      to: COMPANY_EMAIL,
      replyTo: details.email,
      subject: `New booking: ${details.serviceName} — ${details.date}`,
      html: buildBookingSummaryHtml(details),
      attachments,
    });

    await transport.sendMail({
      from: FROM_EMAIL,
      to: details.email,
      subject: confirmation.subject,
      html: confirmation.html,
    });

    return { ok: true, provider: "smtp", customerNotified: true };
  } catch (error) {
    console.error("SMTP email send error:", error);
    return { ok: false, error: formatProviderError(error) };
  }
}

async function sendViaResend(details: BookingEmailDetails): Promise<SendBookingEmailsResult> {
  const resend = getResendClient();
  if (!resend) {
    return { ok: false, error: "Resend is not configured." };
  }

  const attachments = buildPhotoAttachments(details.photos);
  const confirmation = buildConfirmationBody(details);

  try {
    const companyResult = await resend.emails.send({
      from: FROM_EMAIL,
      to: COMPANY_EMAIL,
      replyTo: details.email,
      subject: `New booking: ${details.serviceName} — ${details.date}`,
      html: buildBookingSummaryHtml(details),
      attachments: attachments.length > 0 ? attachments : undefined,
    });

    if (companyResult.error) {
      console.error("Failed to send company email:", companyResult.error);
      return { ok: false, error: formatProviderError(companyResult.error) };
    }

    const customerResult = await resend.emails.send({
      from: FROM_EMAIL,
      to: details.email,
      subject: confirmation.subject,
      html: confirmation.html,
    });

    if (customerResult.error) {
      console.error("Failed to send customer email:", customerResult.error);
      return { ok: false, error: formatProviderError(customerResult.error) };
    }

    return { ok: true, provider: "resend", customerNotified: true };
  } catch (error) {
    console.error("Resend email send error:", error);
    return { ok: false, error: formatProviderError(error) };
  }
}

export async function sendBookingEmails(
  details: BookingEmailDetails,
): Promise<SendBookingEmailsResult> {
  const hasWeb3Forms = Boolean(process.env.WEB3FORMS_ACCESS_KEY);
  const hasSmtp = Boolean(
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS,
  );
  const hasResend = Boolean(process.env.RESEND_API_KEY);

  if (!hasWeb3Forms && !hasSmtp && !hasResend) {
    console.error(
      "No email provider configured. Set WEB3FORMS_ACCESS_KEY, SMTP credentials, or RESEND_API_KEY.",
    );
    return {
      ok: false,
      error:
        "Email is not configured. Add WEB3FORMS_ACCESS_KEY (easiest) or SMTP / Resend credentials.",
    };
  }

  // Easiest setup: Web3Forms forwards bookings to your inbox automatically.
  if (hasWeb3Forms) {
    const web3Result = await sendViaWeb3Forms(details);
    if (!web3Result.ok) {
      return web3Result;
    }

    const customerNotified = await sendCustomerConfirmation(details);
    return { ...web3Result, customerNotified };
  }

  if (hasSmtp) {
    const smtpResult = await sendViaSmtp(details);
    if (smtpResult.ok) {
      return smtpResult;
    }
    console.error("SMTP failed, trying Resend fallback:", smtpResult.error);
  }

  if (hasResend) {
    return sendViaResend(details);
  }

  return { ok: false, error: "Failed to send emails." };
}
