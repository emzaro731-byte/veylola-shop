import {NextResponse} from "next/server";
import {createClient} from "@supabase/supabase-js";
export async function POST(req:Request){
 const auth=req.headers.get("authorization"); if(!auth?.startsWith("Bearer "))return NextResponse.json({error:"Sign in required."},{status:401});
 const {reference}=await req.json(); if(!reference||!process.env.PAYSTACK_SECRET_KEY)return NextResponse.json({error:"Invalid request."},{status:400});
 const response=await fetch("https://api.paystack.co/transaction/verify/"+encodeURIComponent(reference),{headers:{Authorization:`Bearer ${process.env.PAYSTACK_SECRET_KEY}`}});
 const result=await response.json(); if(!response.ok||!result.status)return NextResponse.json({error:result.message||"Verification failed."},{status:400});
 const tx=result.data;
 const supabase=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,{global:{headers:{Authorization:auth}}});
 const {data:{user}}=await supabase.auth.getUser(); if(!user)return NextResponse.json({error:"Invalid session."},{status:401});
 const {data:order}=await supabase.from("orders").select("id,total,payment_reference").eq("payment_reference",reference).eq("user_id",user.id).single();
 if(!order)return NextResponse.json({error:"Order not found."},{status:404});
 if(tx.status==="success" && Number(tx.amount)===Math.round(Number(order.total)*100)){
  await supabase.from("orders").update({status:"paid",payment_status:"paid",paid_at:new Date().toISOString()}).eq("id",order.id).eq("user_id",user.id);
  return NextResponse.json({success:true,status:"paid",order_id:order.id});
 }
 return NextResponse.json({success:false,status:tx.status},{status:200});
}