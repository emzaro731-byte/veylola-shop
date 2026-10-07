import crypto from "crypto";
import {NextResponse} from "next/server";
import {createClient} from "@supabase/supabase-js";
export async function POST(req:Request){
 const raw=await req.text(); const signature=req.headers.get("x-paystack-signature")||"";
 if(!process.env.PAYSTACK_SECRET_KEY)return new NextResponse("Not configured",{status:503});
 const hash=crypto.createHmac("sha512",process.env.PAYSTACK_SECRET_KEY).update(raw).digest("hex");
 if(!crypto.timingSafeEqual(Buffer.from(hash),Buffer.from(signature)))return new NextResponse("Invalid signature",{status:401});
 const event=JSON.parse(raw);
 if(event.event==="charge.success"){
  const tx=event.data;
  const supabase=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const {data:order}=await supabase.from("orders").select("id,total").eq("payment_reference",tx.reference).single();
  if(order && Number(tx.amount)===Math.round(Number(order.total)*100)){
   await supabase.from("orders").update({status:"paid",payment_status:"paid",paid_at:new Date().toISOString()}).eq("id",order.id);
  }
 }
 return new NextResponse("OK",{status:200});
}