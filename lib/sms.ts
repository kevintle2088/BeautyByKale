import twilio from "twilio";

function getClient() {
  const { TWILIO_ACCOUNT_SID, TWILIO_API_KEY_SID, TWILIO_API_KEY_SECRET } = process.env;
  if (!TWILIO_ACCOUNT_SID || !TWILIO_API_KEY_SID || !TWILIO_API_KEY_SECRET) return null;
  return twilio(TWILIO_API_KEY_SID, TWILIO_API_KEY_SECRET, { accountSid: TWILIO_ACCOUNT_SID });
}

// Normalizes US phone numbers to E.164 (+1XXXXXXXXXX), which Twilio requires.
function toE164(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}

// Fire-and-forget: an SMS failure should never break a booking operation.
export async function sendSMS(rawTo: string, body: string) {
  const client = getClient();
  const from = process.env.TWILIO_PHONE_NUMBER;
  if (!client || !from) {
    console.warn("Twilio not configured — skipping SMS:", body);
    return;
  }

  const to = toE164(rawTo);
  if (!to) {
    console.warn("Skipping SMS — could not parse phone number:", rawTo);
    return;
  }

  try {
    await client.messages.create({ to, from, body });
  } catch (err) {
    console.error("Failed to send SMS:", err);
  }
}

export function formatApptDateTime(date: string, time: string): string {
  const [hourStr, minuteStr] = time.split(":");
  const hour = parseInt(hourStr, 10);
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  const d = new Date(`${date}T00:00:00`);
  const dateLabel = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${dateLabel} at ${hour12}:${minuteStr} ${period}`;
}

export async function notifyAdmin(body: string) {
  const adminPhone = process.env.ADMIN_PHONE_NUMBER;
  if (!adminPhone) {
    console.warn("ADMIN_PHONE_NUMBER not configured — skipping admin SMS:", body);
    return;
  }
  await sendSMS(adminPhone, body);
}
