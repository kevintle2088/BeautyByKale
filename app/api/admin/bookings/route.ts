import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request: Request){

    const password = request.headers.get('admin-password');    
       if(password != process.env.ADMIN_PASSWORD){
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