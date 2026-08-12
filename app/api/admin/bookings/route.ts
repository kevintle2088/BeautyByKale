import { supabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/adminAuth";
import { NextResponse } from "next/server";

export async function GET(request: Request){

    const user = await requireAdmin(request);
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const{data, error} = await supabaseAdmin()
    .from('bookings')
    .select('*, slots(*)')
    .order('created_at' ,{ascending:false})
    

    if(error){
        return NextResponse.json({error:error.message}, {status:500})
    }

    return NextResponse.json({bookings: data})
}

export async function POST(request: Request) {
    const user = await requireAdmin(request);
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { slot_id, client_name, client_email, client_phone, service } = body;

    if (!slot_id || !client_email || !client_name || !client_phone || !service) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data: slot, error: slotError } = await supabaseAdmin()
        .from("slots")
        .select()
        .eq("id", slot_id)
        .eq("status", "open")
        .single();

    if (slotError || !slot) {
        return NextResponse.json({ error: "Slot no longer available" }, { status: 409 });
    }

    const { data: booking, error: bookingError } = await supabaseAdmin()
        .from("bookings")
        .insert({
            slot_id,
            client_email: client_email.toLowerCase().trim(),
            client_name,
            client_phone,
            service,
            status: "accepted",
        })
        .select()
        .single();

    if (bookingError) {
        return NextResponse.json({ error: bookingError.message }, { status: 500 });
    }

    const { error: updateError } = await supabaseAdmin()
        .from("slots")
        .update({ status: "booked" })
        .eq("id", slot_id);

    if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ booking }, { status: 201 });
}