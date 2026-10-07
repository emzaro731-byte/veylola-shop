"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabase";

export default function AliExpressAdmin() {
  const [keyword,setKeyword]=useState("");
  const [rate,setRate]=useState("1500");
  const [markup,setMarkup]=useState("40");
  const [products,setProducts]=useState<any[]>([]);
  const [message,setMessage]=useState("");
  const [busy,setBusy]=useState(false);

  async function callApi(method:"POST"|"PUT", body:any) {
    if (!supabase) throw new Error("Supabase is not configured.");
    const {data:{session}}=await supabase.auth.getSession();
    if(!session) throw new Error("Sign in first.");
    const r=await fetch("/api/aliexpress",{method,headers:{"Content-Type":"application/json","Authorization":"Bearer "+session.access_token},body:JSON.stringify(body)});
    const d=await r.json();
    if(!r.ok) throw new Error(d.error||"Request failed");
    return d;
  }

  async function search() {
    setBusy(true); setMessage("");
    try {
      const d=await callApi("POST",{action:"search",keyword,page:1});
      setProducts(d.products||[]);
      if(!d.products?.length) setMessage("No products found.");
    } catch(e) { setMessage(e instanceof Error?e.message:"Search failed."); }
    finally { setBusy(false); }
  }

  async function importProduct(p:any) {
    try {
      await callApi("PUT",{product:p,usdToNgn:Number(rate),markupPercent:Number(markup)});
      setMessage("Product imported successfully.");
    } catch(e) { setMessage(e instanceof Error?e.message:"Import failed."); }
  }

  return <main style={{maxWidth:1000,margin:"40px auto",padding:20,fontFamily:"Arial"}}>
    <h1>AliExpress Importer</h1>
    <p>Search AliExpress and import products into Veylola with automatic NGN pricing.</p>
    <div style={{display:"grid",gap:10,gridTemplateColumns:"2fr 1fr 1fr"}}>
      <input value={keyword} onChange={e=>setKeyword(e.target.value)} placeholder="e.g. wireless earbuds"/>
      <input value={rate} onChange={e=>setRate(e.target.value)} placeholder="USD → NGN"/>
      <input value={markup} onChange={e=>setMarkup(e.target.value)} placeholder="Markup %"/>
    </div>
    <button onClick={search} disabled={busy} style={{margin:"15px 0",padding:"12px 20px"}}>{busy?"Searching...":"Search AliExpress"}</button>
    {message&&<p>{message}</p>}
    <div style={{display:"grid",gap:16}}>
      {products.map((p:any,i:number)=><article key={p.product_id||i} style={{border:"1px solid #ddd",borderRadius:14,padding:14,display:"grid",gridTemplateColumns:"100px 1fr auto",gap:14,alignItems:"center"}}>
        <img src={p.product_main_image_url||p.product_main_image||""} alt="" style={{width:100,height:100,objectFit:"cover",borderRadius:10}}/>
        <div><b>{p.product_title}</b><p>Supplier: $\{p.sale_price||p.app_sale_price||"—"}</p></div>
        <button onClick={()=>importProduct(p)} style={{padding:"10px 14px"}}>Import</button>
      </article>)}
    </div>
  </main>
}