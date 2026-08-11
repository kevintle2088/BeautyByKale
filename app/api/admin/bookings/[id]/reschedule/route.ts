import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const password = request.headers.get('admin-password');
  if (password != process.env.ADMIN_PASSWORD) {
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

  const { data: newSlot, error: newSlotError } = await supabaseAdmin()
    .from('slots')
    .select()
    .eq('id', new_slot_id)
    .eq('status', 'open')
    .single();

  if (newSlotError || !newSlot) {
    return NextResponse.json({ error: "That slot is no longer available" }, { status: 409 });
  }

  const { error: freeOldSlotError } = await supabaseAdmin()
    .from('slots')
    .update({ status: 'open' })
    .eq('id', booking.slot_id);

  if (freeOldSlotError) {
    return NextResponse.json({ error: freeOldSlotError.message }, { status: 500 });
  }

  const newSlotStatus = booking.status === 'accepted' ? 'booked' : 'pending';

  const { error: claimNewSlotError } = await supabaseAdmin()
    .from('slots')
    .update({ status: newSlotStatus })
    .eq('id', new_slot_id);

  if (claimNewSlotError) {
    return NextResponse.json({ error: claimNewSlotError.message }, { status: 500 });
  }

  const { error: updateBookingError } = await supabaseAdmin()
    .from('bookings')
    .update({ slot_id: new_slot_id })
    .eq('id', id);

  if (updateBookingError) {
    return NextResponse.json({ error: updateBookingError.message }, { status: 500 });
  }

  return NextResponse.json(
    { message: "Booking rescheduled", bookingId: id, newSlotId: new_slot_id },
    { status: 200 }
  );
}