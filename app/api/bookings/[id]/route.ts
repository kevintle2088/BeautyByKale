import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: Request, {params} : {params: Promise<{id: string}>}){
 
    const {id} = await params;
    const body = await request.json();
    const {email} = body;

    const {data: bookings, error } = await supabaseAdmin()
        .from('bookings')
        .select()
        .eq('id',id)
        .single()

        if(error){
            return NextResponse.json({error: "That appointment no longer exist"},{status:400});
        }

        if(bookings.client_email != email.toLowerCase().trim()){
            return NextResponse.json({error: "Email does not match booking"} , {status:403});
        }

        if (bookings.status === 'cancelled') {
            return NextResponse.json({ error: "This appointment was already cancelled" }, { status: 400 });
        }
        
    const { error: cancelUpdateError } = await supabaseAdmin()
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', id);
    
        if(cancelUpdateError){
            return NextResponse.json({error: cancelUpdateError.message}, {status:500});
        }
     const { error: openUpdateError } = await supabaseAdmin()
        .from('slots')
        .update({ status: 'open' })
        .eq('id', bookings.slot_id)
        if(openUpdateError){
            return NextResponse.json({error: openUpdateError.message}, {status:500});
        }

    return NextResponse.json({message: "Appointmnet successfull cancelled" , bookings} ,{status:200});
    }