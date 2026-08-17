import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: openSlots, error: fetchError } = await supabaseAdmin()
    .from("slots")
    .select("id, date, time")
    .eq("status", "open");

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  const now = new Date();
  const expiredIds = (openSlots || [])
    .filter((slot) => new Date(`${slot.date}T${slot.time}`) < now)
    .map((slot) => slot.id);

  if (expiredIds.length === 0) {
    return NextResponse.json({ deleted: 0 });
  }

  const { error: deleteError } = await supabaseAdmin()
    .from("slots")
    .delete()
    .in("id", expiredIds);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ deleted: expiredIds.length });
}
