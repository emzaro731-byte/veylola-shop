import crypto from "crypto";
import {NextResponse} from "next/server";
import {createClient} from "@supabase/supabase-js";

export async function POST(req:Request){
 const raw=await req.text();
 const signature=req.headers.get("verif-hash")||"";
 if(!process.env.FLW_SECRET_HASH||signature!==process.env.FLW_SECRET_HASH)return new NextResponse("Invalid signature",{status:401});
 if(!process.env.FLW_SECRET_KEY||!process.env.SUPABASE_SERVICE_ROLE_KEY)return new NextResponse("Not configured",{status:503});
 try{
  const event=JSON.parse(raw); const tx=event.data;
  if(tx?.id&&tx?.tx_ref){
   const response=await fetch("https://api.flutterwave.com/v3/transactions/"+encodeURIComponent(String(tx.id))+"/verify",{headers:{Authorization:`Bearer ${process.env.FLW_SECRET_KEY}`,"Content-Type":"application/json"}});
   const result=await response.json(); const verified=result.data;
   if(response.ok&&result.status==="success"&&verified?.status==="successful"){
    const supabase=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const {data:order}=await supabase.from("orders").select("id,total").eq("payment_reference",verified.tx_ref).single();
    if(order&&verified.tx_ref&&verified.currency==="NGN"&&Number(verified.amount)>=Number(order.total)){
     await supabase.from("orders").update({status:"paid",payment_status:"paid",paid_at:new Date().toISOString()}).eq("id",order.id);
    }
   }
  }
  return new NextResponse("OK",{status:200});
 }catch{return new NextResponse("OK",{status:200})}
}
