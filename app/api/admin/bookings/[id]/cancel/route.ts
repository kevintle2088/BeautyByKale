import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/adminAuth";
import { sendSMS, formatApptDateTime } from "@/lib/sms";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const { data: booking, error: findError } = await supabaseAdmin()
    .from('bookings')
    .select('*, slots(*)')
    .eq('id', id)
    .single();

  if (findError || !booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (booking.status === 'cancelled') {
    return NextResponse.json({ error: "This booking is already cancelled" }, { status: 400 });
  }

  const { error: bookingUpdateError } = await supabaseAdmin()
    .from('bookings')
    .update({ status: "cancelled" })
    .eq('id', id);

  if (bookingUpdateError) {
    return NextResponse.json({ error: bookingUpdateError.message }, { status: 500 });
  }

  const { error: slotUpdateError } = await supabaseAdmin()
    .from('slots')
    .update({ status: "open" })
    .eq('id', booking.slot_id);

  if (slotUpdateError) {
    return NextResponse.json({ error: slotUpdateError.message }, { status: 500 });
  }

  if (booking.slots) {
    await sendSMS(
      booking.client_phone,
      `Hi ${booking.client_name}, your ${booking.service} appointment on ${formatApptDateTime(booking.slots.date, booking.slots.time)} has been cancelled. Please contact us if you have questions.`
    );
  }

  return NextResponse.json({ message: "Booking cancelled" }, { status: 200 });
}