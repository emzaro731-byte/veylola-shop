"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabase";

export default function JumiaAdmin() {
  const [url,setUrl]=useState("");
  const [name,setName]=useState("");
  const [image,setImage]=useState("");
  const [price,setPrice]=useState("");
  const [markup,setMarkup]=useState("40");
  const [message,setMessage]=useState("");
  const [busy,setBusy]=useState(false);

  async function callApi(method:"POST"|"PUT", body:any) {
    if (!supabase) throw new Error("Supabase is not configured.");
    const {data:{session}}=await supabase.auth.getSession();
    if(!session) throw new Error("Sign in first.");
    const r=await fetch("/api/jumia",{method,headers:{"Content-Type":"application/json","Authorization":"Bearer "+session.access_token},body:JSON.stringify(body)});
    const d=await r.json();
    if(!r.ok) throw new Error(d.error||"Request failed");
    return d;
  }

  async function readProduct() {
    setBusy(true); setMessage("");
    try {
      const d=await callApi("POST",{url});
      setName(d.product.name || "Jumia product");
      setImage(d.product.image || "");
      setUrl(d.product.url || url);
      setMessage("Product details loaded. Confirm the supplier price, then import.");
    } catch(e) { setMessage(e instanceof Error?e.message:"Could not load product."); }
    finally { setBusy(false); }
  }

  async function importProduct() {
    setBusy(true); setMessage("");
    try {
      const d=await callApi("PUT",{url,name,image,supplierPrice:Number(price),markupPercent:Number(markup)});
      setMessage("Jumia product imported. Selling price: ₦"+Number(d.retailPrice).toLocaleString()+" | Gross profit: ₦"+Number(d.profit).toLocaleString());
    } catch(e) { setMessage(e instanceof Error?e.message:"Import failed."); }
    finally { setBusy(false); }
  }

  return <main style={{maxWidth:850,margin:"40px auto",padding:20,fontFamily:"Arial"}}>
    <h1>Jumia Products</h1>
    <p>Add products from Jumia to Veylola and automatically calculate your selling price.</p>
    <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="Paste Jumia product URL" style={{width:"100%",padding:12,marginBottom:10}}/>
    <button onClick={readProduct} disabled={busy||!url} style={{padding:"12px 20px"}}>{busy?"Loading...":"Load Jumia Product"}</button>
    <div style={{display:"grid",gap:10,marginTop:20}}>
      <input value={name} onChange={e=>setName(e.target.value)} placeholder="Product name" style={{padding:12}}/>
      <input value={price} onChange={e=>setPrice(e.target.value)} placeholder="Jumia supplier price (NGN)" type="number" style={{padding:12}}/>
      <input value={markup} onChange={e=>setMarkup(e.target.value)} placeholder="Markup %" type="number" style={{padding:12}}/>
      <input value={image} onChange={e=>setImage(e.target.value)} placeholder="Product image URL (optional)" style={{padding:12}}/>
    </div>
    <button onClick={importProduct} disabled={busy||!name||!price||!url} style={{marginTop:15,padding:"12px 20px"}}>Import to Veylola</button>
    {message&&<p>{message}</p>}
  </main>;
}