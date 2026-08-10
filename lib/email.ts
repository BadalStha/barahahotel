import type { Booking, Guest, Room, RoomType } from "@prisma/client";
import { format } from "date-fns";
import { Resend } from "resend";

import { nightsBetween } from "@/lib/dates";
import { formatNPR } from "@/lib/format";

export type BookingWithRoom = Booking & {
  guest: Guest;
  room: Room & { roomType: RoomType };
};

export type EmailResult =
  | { sent: true }
  | { sent: false; reason: "not_configured" | "no_recipient" | "error" };

const HOTEL_NAME = "Baraha Hotel and Lodge";

/** Escape HTML entities before interpolating user input into email HTML. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function bookingEmailHtml(booking: BookingWithRoom): string {
  const nights = nightsBetween(booking.checkIn, booking.checkOut);
  const total = Number(booking.roomRateAtBooking) * nights;
  const date = (d: Date) => format(d, "EEE, MMM d, yyyy");
  return `
<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#2B2620;">
  <div style="background:#1F4D3A;color:#F6F1E9;padding:24px 28px;border-radius:12px 12px 0 0;">
    <h1 style="margin:0;font-size:20px;">${HOTEL_NAME}</h1>
    <p style="margin:4px 0 0;opacity:.85;font-size:13px;">Bhedetar, Dhankuta, Nepal</p>
  </div>
  <div style="background:#fff;border:1px solid #e5ddd0;border-top:0;padding:28px;border-radius:0 0 12px 12px;">
    <h2 style="margin:0 0 6px;font-size:18px;">Booking request received</h2>
    <p style="margin:0 0 20px;font-size:14px;color:#555;">Hi ${booking.guest.fullName}, your request is <strong>pending confirmation</strong> — we'll be in touch shortly.</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr><td style="padding:8px 0;color:#888;width:40%;">Booking code</td><td style="font-weight:bold;">${booking.bookingCode}</td></tr>
      <tr><td style="padding:8px 0;color:#888;">Room type</td><td>${booking.room.roomType.name} (Room ${booking.room.roomNumber})</td></tr>
      <tr><td style="padding:8px 0;color:#888;">Check-in</td><td>${date(booking.checkIn)}</td></tr>
      <tr><td style="padding:8px 0;color:#888;">Check-out</td><td>${date(booking.checkOut)}</td></tr>
      <tr><td style="padding:8px 0;color:#888;">Guests</td><td>${booking.numGuests}</td></tr>
      <tr><td style="padding:8px 0;color:#888;">Rate</td><td>${formatNPR(Number(booking.roomRateAtBooking))} / night</td></tr>
      <tr><td style="padding:8px 0;color:#888;">Estimated total</td><td style="font-weight:bold;">${formatNPR(total)} (${nights} night${nights === 1 ? "" : "s"})</td></tr>
    </table>
    <p style="margin:24px 0 0;font-size:13px;color:#888;">Questions? Call us or reply to this email — we're happy to help.</p>
  </div>
</div>`;
}

/**
 * Send a message from the public contact form to the hotel inbox.
 * Returns gracefully (never throws) so the form can degrade to "we'll
 * respond soon" when email isn't configured.
 */
export async function sendContactEmail({
  name,
  email,
  phone,
  message,
  to,
}: {
  name: string;
  email: string;
  phone?: string;
  message: string;
  to: string;
}): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY is not set — skipping contact email");
    return { sent: false, reason: "not_configured" };
  }

  const from =
    process.env.RESEND_FROM_EMAIL ?? `${HOTEL_NAME} <onboarding@resend.dev>`;
  const resend = new Resend(apiKey);

  try {
    const { error } = await resend.emails.send({
      from,
      to: [to],
      replyTo: [email],
      subject: `${HOTEL_NAME} — website message from ${name}`,
      html: `
<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#2B2620;">
  <div style="background:#1F4D3A;color:#F6F1E9;padding:24px 28px;border-radius:12px 12px 0 0;">
    <h1 style="margin:0;font-size:20px;">New website message</h1>
  </div>
  <div style="background:#fff;border:1px solid #e5ddd0;border-top:0;padding:28px;border-radius:0 0 12px 12px;font-size:14px;">
    <p style="margin:0 0 16px;">Someone sent a message from the contact form:</p>
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:6px 0;color:#888;width:25%;">Name</td><td style="font-weight:bold;">${escapeHtml(name)}</td></tr>
      <tr><td style="padding:6px 0;color:#888;">Email</td><td><a href="mailto:${escapeHtml(email)}" style="color:#1F4D3A;">${escapeHtml(email)}</a></td></tr>
      ${phone ? `<tr><td style="padding:6px 0;color:#888;">Phone</td><td>${escapeHtml(phone)}</td></tr>` : ""}
    </table>
    <div style="margin:16px 0 0;padding:16px;background:#F6F1E9;border-radius:8px;white-space:pre-wrap;">${escapeHtml(message)}</div>
  </div>
</div>`,
    });
    if (error) {
      console.error("[email] Resend contact send failed:", error);
      return { sent: false, reason: "error" };
    }
    return { sent: true };
  } catch (error) {
    console.error("[email] Resend contact threw:", error);
    return { sent: false, reason: "error" };
  }
}

/**
 * Send a booking confirmation email. Returns gracefully without throwing:
 * when RESEND_API_KEY isn't configured (dev), we log and skip so booking
 * creation never fails because email is unavailable.
 */
export async function sendBookingConfirmationEmail(
  booking: BookingWithRoom,
): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(
      "[email] RESEND_API_KEY is not set — skipping confirmation email for",
      booking.bookingCode,
    );
    return { sent: false, reason: "not_configured" };
  }

  const to = booking.guest.email;
  if (!to) return { sent: false, reason: "no_recipient" };

  const from =
    process.env.RESEND_FROM_EMAIL ??
    `${HOTEL_NAME} <onboarding@resend.dev>`;

  const resend = new Resend(apiKey);
  try {
    const { error } = await resend.emails.send({
      from,
      to: [to],
      subject: `${HOTEL_NAME} — booking request ${booking.bookingCode}`,
      html: bookingEmailHtml(booking),
    });
    if (error) {
      console.error("[email] Resend send failed:", error);
      return { sent: false, reason: "error" };
    }
    return { sent: true };
  } catch (error) {
    console.error("[email] Resend threw:", error);
    return { sent: false, reason: "error" };
  }
}
