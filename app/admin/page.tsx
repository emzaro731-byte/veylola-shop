"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function AdminDashboard() {
  const [email,setEmail]=useState("");
  const [count,setCount]=useState<number|null>(null);
  const [message,setMessage]=useState("");

  useEffect(() => {
    (async () => {
      if (!supabase) return;
      const { data:{session} } = await supabase.auth.getSession();
      if (!session) { setMessage("Please sign in."); return; }
      setEmail(session.user.email || "");
      const { count, error } = await supabase.from("products").select("*",{count:"exact",head:true}).eq("active",true);
      if (!error) setCount(count ?? 0);
    })();
  }, []);

  return <main style={{maxWidth:1000,margin:"40px auto",padding:20,fontFamily:"Arial"}}>
    <h1>Veylola Admin Dashboard</h1>
    <p>Manage products and publish Jumia-sourced products to your Veylola storefront.</p>
    {email && <p>Signed in as <b>{email}</b></p>}
    {message && <p>{message}</p>}
    <section style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:16,margin:"24px 0"}}>
      <div style={{border:"1px solid #ddd",borderRadius:16,padding:20}}>
        <h2>{count ?? "—"}</h2><p>Active products</p>
      </div>
      <Link href="/admin/jumia" style={{border:"1px solid #ddd",borderRadius:16,padding:20,textDecoration:"none",color:"inherit"}}>
        <h2>Jumia Products</h2><p>Paste a Jumia link, set supplier price and markup, then publish.</p>
      </Link>
    </section>
  </main>;
}