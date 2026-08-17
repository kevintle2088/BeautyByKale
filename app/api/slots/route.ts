import { NextResponse } from "next/server";
import { supabasePublic, supabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET() {
  const { data, error } = await supabasePublic
    .from("slots")
    .select("*")
    .eq("status", "open")
    .order("date", { ascending: true })
    .order("time", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const now = new Date();
  const upcoming = (data || []).filter(
    (slot) => new Date(`${slot.date}T${slot.time}`) > now
  );

  return NextResponse.json({ slots: upcoming });
}

export async function POST(request: Request) {
  const user = await requireAdmin(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { date, time, duration_minutes } = body;

  if (!date || !time) {
    return NextResponse.json({ error: "Missing" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin()
    .from("slots")
    .insert({ date, time, duration_minutes: duration_minutes || 150 })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ slot: data }, { status: 201 });
}