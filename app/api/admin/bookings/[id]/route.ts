    import { supabaseAdmin } from "@/lib/supabase";
    import { requireAdmin } from "@/lib/adminAuth";
    import { NextResponse } from "next/server";

    export async function PATCH(request:Request, {params}: {params: Promise<{id : string}>}){
        const user = await requireAdmin(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const {id} = await params;
        const {action} = await request.json();
        if(!["accept","decline"].includes(action)){
            return NextResponse.json({error: "action must be 'accept' or 'decline'"},{status:400})
        }

        const {data:booking , error} = await supabaseAdmin()
        .from('bookings')
        .select()
        .eq('id', id)
        .single()

         if (error || !booking) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }

        const bookingStatus = action == "accept" ? "accepted" : "declined";
        const slotStatus = action == "accept" ? "booked" : "open";

        const { error: bookingUpdateError } = await supabaseAdmin()
            .from('bookings')
            .update({ status: bookingStatus })
            .eq('id', id);

            if (bookingUpdateError) {
            return NextResponse.json({ error: bookingUpdateError.message }, { status: 500 });
        }

        const { error: slotUpdateError } = await supabaseAdmin()
            .from('slots')
            .update({ status: slotStatus }) 
            .eq('id', booking.slot_id);

            if (slotUpdateError) {
            return NextResponse.json({ error: slotUpdateError.message }, { status: 500 });
        }

        return NextResponse.json(
    { message: `Booking ${bookingStatus}`, bookingId: id, status: bookingStatus } ,{ status: 200 }
        );
    }