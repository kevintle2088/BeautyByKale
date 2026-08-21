import { supabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/adminAuth";
import { sendSMS, formatApptDateTime } from "@/lib/sms";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAdmin(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { new_slot_id } = await request.json();

  if (!new_slot_id) {
    return NextResponse.json({ error: "new_slot_id is required" }, { status: 400 });
  }

  const { data: booking, error: bookingError } = await supabaseAdmin()
    .from('bookings')
    .select()
    .eq('id', id)
    .single();

  if (bookingError || !booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (booking.status === 'cancelled' || booking.status === 'declined') {
    return NextResponse.json(
      { error: "Can't reschedule a cancelled or declined booking" },
      { status: 400 }
    );
  }

  const newSlotStatus = booking.status === 'accepted' ? 'booked' : 'pending';

  // atomically claim the new slot: only succeeds if it's still 'open', so a
  // concurrent client booking (or another reschedule) can't win the same slot
  const { data: newSlot, error: newSlotError } = await supabaseAdmin()
    .from('slots')
    .update({ status: newSlotStatus })
    .eq('id', new_slot_id)
    .eq('status', 'open')
    .select()
    .single();

  if (newSlotError || !newSlot) {
    return NextResponse.json({ error: "That slot is no longer available" }, { status: 409 });
  }

  const { error: freeOldSlotError } = await supabaseAdmin()
    .from('slots')
    .update({ status: 'open' })
    .eq('id', booking.slot_id);

  if (freeOldSlotError) {
    // couldn't free the old slot — undo the new slot claim
    await supabaseAdmin().from('slots').update({ status: 'open' }).eq('id', new_slot_id);
    return NextResponse.json({ error: freeOldSlotError.message }, { status: 500 });
  }

  const { error: updateBookingError } = await supabaseAdmin()
    .from('bookings')
    .update({ slot_id: new_slot_id })
    .eq('id', id);

  if (updateBookingError) {
    // couldn't repoint the booking — undo both slot changes
    await supabaseAdmin().from('slots').update({ status: newSlotStatus }).eq('id', booking.slot_id);
    await supabaseAdmin().from('slots').update({ status: 'open' }).eq('id', new_slot_id);
    return NextResponse.json({ error: updateBookingError.message }, { status: 500 });
  }

  if (booking.sms_opt_in) {
    await sendSMS(
      booking.client_phone,
      `Hi ${booking.client_name}, your ${booking.service} appointment has been rescheduled to ${formatApptDateTime(newSlot.date, newSlot.time)}.`
    );
  }

  return NextResponse.json(
    { message: "Booking rescheduled", bookingId: id, newSlotId: new_slot_id },
    { status: 200 }
  );
}