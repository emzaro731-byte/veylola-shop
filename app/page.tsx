"use client";

import { useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

type Product={id:string;name:string;category:string;price:number;supplierPrice:number;image:string};
type CartItem=Product&{qty:number};
const products:Product[]=[
{id:"11111111-1111-4111-8111-111111111111",name:"Magnetic Phone Holder",category:"Phone Accessories",price:12900,supplierPrice:6500,image:"https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=800&q=80"},
{id:"22222222-2222-4222-8222-222222222222",name:"Mini Portable Blender",category:"Home & Kitchen",price:21900,supplierPrice:11800,image:"https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=800&q=80"},
{id:"33333333-3333-4333-8333-333333333333",name:"Smart LED Desk Lamp",category:"Home & Office",price:18500,supplierPrice:9200,image:"https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80"},
{id:"44444444-4444-4444-8444-444444444444",name:"Wireless Earbuds Case",category:"Electronics",price:9900,supplierPrice:4200,image:"https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=800&q=80"}];

export default function Home(){
 const [query,setQuery]=useState(""); const [cart,setCart]=useState<CartItem[]>([]); const [open,setOpen]=useState(false);
 const [name,setName]=useState(""); const [address,setAddress]=useState(""); const [busy,setBusy]=useState(false); const [message,setMessage]=useState("");
 const shown=useMemo(()=>products.filter(p=>(p.name+" "+p.category).toLowerCase().includes(query.toLowerCase())),[query]);
 const money=(n:number)=>new Intl.NumberFormat("en-NG",{style:"currency",currency:"NGN",maximumFractionDigits:0}).format(n);
 const add=(p:Product)=>setCart(c=>{const x=c.find(i=>i.id===p.id);return x?c.map(i=>i.id===p.id?{...i,qty:i.qty+1}:i):[...c,{...p,qty:1}]});
 const total=cart.reduce((s,i)=>s+i.price*i.qty,0); const count=cart.reduce((s,i)=>s+i.qty,0);
 const checkout=async()=>{
  setMessage("");
  if(!cart.length)return;
  if(!supabase){setMessage("Supabase is not configured.");return;}
  if(!name.trim()||!address.trim()){setMessage("Enter your full name and delivery address.");return;}
  setBusy(true);
  try{
   const {data:{session}}=await supabase.auth.getSession();
   if(!session){setMessage("Please sign in before checkout.");return;}
   const res=await fetch("/api/flutterwave/initialize",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+session.access_token},body:JSON.stringify({items:cart.map(i=>({id:i.id,qty:i.qty})),customer_name:name.trim(),shipping_address:address.trim()})});
   const data=await res.json();
   if(!res.ok||!data.checkout_url){setMessage(data.error||"Could not start payment.");return;}
   window.location.href=data.checkout_url;
  }catch{setMessage("Could not connect to the payment service.");}
  finally{setBusy(false);}
 };
 return <main>
  <header><div className="brand">VEYLOLA</div><div className="tag">Shop smart. Sell smarter.</div><button onClick={()=>setOpen(true)}>Cart ({count})</button></header>
  <section className="hero"><div><span className="pill">NEW DROPS</span><h1>Products people<br/><em>want to buy.</em></h1><p>Trending products with simple ordering and delivery.</p><a href="#products">Shop now →</a></div></section>
  <section className="toolbar"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search products..." /><span>{shown.length} products</span></section>
  <section id="products" className="grid">{shown.map(p=><article className="card" key={p.id}><img src={p.image} alt={p.name}/><div className="info"><small>{p.category}</small><h2>{p.name}</h2><strong>{money(p.price)}</strong><button onClick={()=>add(p)}>Add to cart</button></div></article>)}</section>
  {open&&<div className="overlay" onClick={()=>setOpen(false)}><aside className="drawer" onClick={e=>e.stopPropagation()}><div className="drawerHead"><h2>Your cart</h2><button className="close" onClick={()=>setOpen(false)}>×</button></div>
   {cart.length===0?<p>Your cart is empty.</p>:<><div className="checkoutForm"><input value={name} onChange={e=>setName(e.target.value)} placeholder="Full name"/><textarea value={address} onChange={e=>setAddress(e.target.value)} placeholder="Delivery address" rows={3}/>{message&&<p>{message}</p>}</div>
   {cart.map(i=><div className="cartRow" key={i.id}><img src={i.image} alt=""/><div><b>{i.name}</b><small>{money(i.price)} × {i.qty}</small><div><button onClick={()=>setCart(c=>i.qty>1?c.map(x=>x.id===i.id?{...x,qty:x.qty-1}:x):c.filter(x=>x.id!==i.id))}>−</button><button onClick={()=>add(i)}>+</button></div></div></div>)}<div className="total"><span>Total</span><b>{money(total)}</b></div><button className="checkout" disabled={busy} onClick={checkout}>{busy?"Opening Flutterwave...":"Pay with Flutterwave"}</button></>}</aside></div>}
 </main>
}
