import {NextResponse} from "next/server";
import {createClient} from "@supabase/supabase-js";

export async function POST(req:Request){
 try{
  const auth=req.headers.get("authorization");
  if(!auth?.startsWith("Bearer "))return NextResponse.json({error:"Sign in required."},{status:401});
  const {reference,transaction_id}=await req.json();
  if(!reference||!transaction_id||!process.env.FLW_SECRET_KEY)return NextResponse.json({error:"Invalid request."},{status:400});
  const response=await fetch("https://api.flutterwave.com/v3/transactions/"+encodeURIComponent(String(transaction_id))+"/verify",{headers:{Authorization:`Bearer ${process.env.FLW_SECRET_KEY}`,"Content-Type":"application/json"}});
  const result=await response.json();
  if(!response.ok||result.status!=="success")return NextResponse.json({error:result.message||"Verification failed."},{status:400});
  const tx=result.data;
  const supabase=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,{global:{headers:{Authorization:auth}}});
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)return NextResponse.json({error:"Invalid session."},{status:401});
  const {data:order}=await supabase.from("orders").select("id,total,payment_reference").eq("payment_reference",reference).eq("user_id",user.id).single();
  if(!order)return NextResponse.json({error:"Order not found."},{status:404});
  if(tx.status==="successful"&&tx.tx_ref===reference&&tx.currency==="NGN"&&Number(tx.amount)>=Number(order.total)){
   await supabase.from("orders").update({status:"paid",payment_status:"paid",paid_at:new Date().toISOString()}).eq("id",order.id).eq("user_id",user.id);
   return NextResponse.json({success:true,status:"paid",order_id:order.id});
  }
  return NextResponse.json({success:false,status:tx.status},{status:200});
 }catch{return NextResponse.json({error:"Verification failed."},{status:400})}
}
