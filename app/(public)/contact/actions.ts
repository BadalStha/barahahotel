"use server";

import { sendContactEmail } from "@/lib/email";
import { getSiteSettings } from "@/lib/settings";
import { contactMessageSchema } from "@/lib/validators/content";

export type ActionResult = { error?: string; notice?: string };

export async function sendContactMessageAction(
  input: unknown,
): Promise<ActionResult> {
  const parsed = contactMessageSchema.safeParse(input);
  if (!parsed.success) return { error: "Please check your message." };

  // The hotel's own address (editable in the CMS) is the recipient.
  const settings = await getSiteSettings();
  const to =
    (typeof settings.email === "string" && settings.email) ||
    "info@barahahotel.com";

  const result = await sendContactEmail({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone || undefined,
    message: parsed.data.message,
    to,
  });

  if (result.sent) return {};
  if (result.reason === "not_configured") {
    // Dev mode — be honest but don't block the guest.
    return {
      notice:
        "Your message was received. Email delivery isn't configured on this server yet, so it wasn't emailed — for urgent matters please call us.",
    };
  }
  return {
    error: "Something went wrong sending your message — please try again.",
  };
}
