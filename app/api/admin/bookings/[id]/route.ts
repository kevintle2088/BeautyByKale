    import { supabaseAdmin } from "@/lib/supabase";
    import { requireAdmin } from "@/lib/adminAuth";
    import { sendSMS, formatApptDateTime } from "@/lib/sms";
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
        .select('*, slots(*)')
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

        if (action === "accept" && booking.slots && booking.sms_opt_in) {
            await sendSMS(
                booking.client_phone,
                `Hi ${booking.client_name}, your ${booking.service} appointment on ${formatApptDateTime(booking.slots.date, booking.slots.time)} is confirmed! See you then.`
            );
        }

        if (action === "decline" && booking.slots && booking.sms_opt_in) {
            await sendSMS(
                booking.client_phone,
                `Hi ${booking.client_name}, your ${booking.service} appointment on ${formatApptDateTime(booking.slots.date, booking.slots.time)} has been cancelled. Please contact us if you have questions.`
            );
        }

        return NextResponse.json(
    { message: `Booking ${bookingStatus}`, bookingId: id, status: bookingStatus } ,{ status: 200 }
        );
    }