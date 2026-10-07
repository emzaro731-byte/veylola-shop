"use client";

import {useEffect,useState} from "react";
import {useSearchParams} from "next/navigation";
import {supabase} from "../../lib/supabase";

export default function PaymentCallback(){
 const q=useSearchParams();
 const reference=q.get("tx_ref")||"";
 const transactionId=q.get("transaction_id")||"";
 const [status,setStatus]=useState("checking");
 const [message,setMessage]=useState("Confirming your payment...");

 useEffect(()=>{
  (async()=>{
   if(!reference||!transactionId){setStatus("unknown");setMessage("Payment details were not returned by Flutterwave.");return;}
   if(!supabase){setStatus("unknown");setMessage("Supabase is not configured.");return;}
   const {data:{session}}=await supabase.auth.getSession();
   if(!session){setStatus("unknown");setMessage("Please sign in again to view your order status.");return;}
   try{
    const res=await fetch("/api/flutterwave/verify",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+session.access_token},body:JSON.stringify({reference,transaction_id:transactionId})});
    const data=await res.json();
    if(data.success){setStatus("success");setMessage("Payment confirmed. Your order is now paid.");}
    else{setStatus("pending");setMessage("Payment is not confirmed yet. Your order will update automatically when Flutterwave confirms it.");}
   }catch{setStatus("pending");setMessage("We could not confirm the payment immediately. Please check your order again shortly.");}
  })();
 },[reference,transactionId]);

 return <main className="auth"><div className="auth form"><h1>{status==="success"?"Payment confirmed":"Payment status"}</h1><p>{message}</p>{reference&&<p>Your payment reference is {reference}.</p>}<a href="/">Back to Veylola Shop</a></div></main>
}
