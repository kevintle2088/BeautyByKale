import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';


// accepts the user reuqest to book appointment, check for all parameters, and checks if the appointmnet in slots 
// is avabile, check if the user has max 3 pending apts, if so add into bookings table, change the slot to pending.
export async function POST(request: Request){
    const body = await request.json();

    //checks if all params are availble
    const { slot_id, client_name, client_email, client_phone } = body;

    if (!slot_id || !client_email || !client_name || !client_phone) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    //check regex of email to ensure the format is correct.
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(client_email)) {
        return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
        }
    //queries the db for time slots that are open
    const { data: slot, error: slotError } = await supabaseAdmin()
        .from('slots')
        .select()
        .eq('id', slot_id)
        .eq('status', 'open')
        .single();

    if (slotError || !slot) {
        return NextResponse.json({ error: 'Slot no longer available' }, { status: 409 });
    }
    //checks if the user wanting to book has less than 3 appointmnets
    const { count } = await supabaseAdmin()
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('client_email', client_email.toLowerCase().trim())
        .eq('status', 'pending');

    if ((count ?? 0) >= 3) {
     return NextResponse.json(
       { error: "You already have 3 pending appointment requests"},
       { status: 409 }
     );
   }
   // queries the db to insert the time slot into the bookings table
    const { data: booking, error: bookingError } = await supabaseAdmin()
        .from('bookings')
        .insert({ slot_id, client_email: client_email.toLowerCase().trim(), client_name, client_phone })
        .select()
        .single();

    if (bookingError) {
        return NextResponse.json({ error: bookingError.message || 'Failed to create booking' }, { status: 500 });
    }

    //updates the slot to pending
    const { error: updateError } = await supabaseAdmin()
    .from('slots')
    .update({ status: 'pending' })
    .eq('id', slot_id);

    if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ booking }, { status: 201 });
}
