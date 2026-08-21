import { supabaseAdmin } from "@/lib/supabase";
import { sendSMS, formatApptDateTime } from "@/lib/sms";
import { NextResponse } from "next/server";

function tomorrowDateKey(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: bookings, error } = await supabaseAdmin()
    .from("bookings")
    .select("*, slots(*)")
    .eq("status", "accepted")
    .eq("reminder_sent", false)
    .eq("sms_opt_in", true);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const dueDate = tomorrowDateKey();
  const due = (bookings || []).filter((b) => b.slots?.date === dueDate);

  for (const b of due) {
    await sendSMS(
      b.client_phone,
      `Hi ${b.client_name}, this is a reminder for your ${b.service} appointment tomorrow, ${formatApptDateTime(b.slots.date, b.slots.time)}. See you then!`
    );
    await supabaseAdmin().from("bookings").update({ reminder_sent: true }).eq("id", b.id);
  }

  return NextResponse.json({ remindersSent: due.length });
}
