import { supabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/adminAuth";
import { error } from "console";
import { NextResponse } from "next/server";

export async function DELETE(request: Request, {params}:{params: Promise<{id:string}>}){

    const user = await requireAdmin(request);
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {id} = await params;

    const{data:slot , error:slotError} = await supabaseAdmin()
        .from('slots')
        .select()
        .eq('id',id)
        .single();
    if(slotError || !slot){
        return NextResponse.json({error: "Slot not found"} , {status:404})
    }
    if(slot.status !== 'open'){
        return NextResponse.json({error: "This slot is currently booked : Cannot delete"} ,{ status:409});
    }

    const{error:deleteError} = await supabaseAdmin()
    .from('slots')
    .delete()
    .eq('id',id);

    if(deleteError){
        return NextResponse.json({error: deleteError.message}, {status:500});
    }

    return NextResponse.json({message:"Slot Deleted", slotId: id},{status:200});
}