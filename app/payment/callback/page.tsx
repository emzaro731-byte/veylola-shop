"use client";
import {useSearchParams} from "next/navigation";
export default function PaymentCallback(){
 const q=useSearchParams(); const reference=q.get("reference");
 return <main className="auth"><div className="auth form"><h1>Payment received</h1><p>Your payment reference is {reference||"not available"}.</p><p>Veylola will confirm the transaction automatically and update your order.</p><a href="/">Back to Veylola Shop</a></div></main>
}