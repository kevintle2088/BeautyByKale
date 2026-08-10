import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, supabasePublic } from "@/lib/supabase";

export async function GET(){
    const {data,error} = await supabasePublic
    .from("slots")
    .select("*")
    .eq("status","open")
    .order("date",{ascending : true})
    .order("time", {ascending :true});

    if(error){
        return NextResponse.json({error: error.message} , {status : 500});
    }

    return NextResponse.json({slots: data})
}

export async function POST(request: Request){
   const password = request.headers.get('admin-password');    
   if(password != process.env.ADMIN_PASSWORD){
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const{date,time,service,duration_minutes} = body;

    if(!date || !time || !service ){
        return NextResponse.json({error:"Missing"} , {status: 400})
    }

    const {data, error} = await supabaseAdmin()
    .from("slots")
    .insert({date : date, time: time, service:service, duration_minutes : duration_minutes})
    .select()
    .single();

    if(error) {
        return NextResponse.json({error: error.message} , {status :500})
    }

    return NextResponse.json({ slot: data }, { status: 201 });
}
