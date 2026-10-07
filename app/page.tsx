"use client";

import { useMemo, useState } from "react";

type Product={id:number;name:string;category:string;price:number;supplierPrice:number;image:string};
type CartItem=Product&{qty:number};
const products:Product[]=[
{id:1,name:"Magnetic Phone Holder",category:"Phone Accessories",price:12900,supplierPrice:6500,image:"https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=800&q=80"},
{id:2,name:"Mini Portable Blender",category:"Home & Kitchen",price:21900,supplierPrice:11800,image:"https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=800&q=80"},
{id:3,name:"Smart LED Desk Lamp",category:"Home & Office",price:18500,supplierPrice:9200,image:"https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80"},
{id:4,name:"Wireless Earbuds Case",category:"Electronics",price:9900,supplierPrice:4200,image:"https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=800&q=80"}];

export default function Home(){
 const [query,setQuery]=useState(""); const [cart,setCart]=useState<CartItem[]>([]); const [open,setOpen]=useState(false);
 const shown=useMemo(()=>products.filter(p=>(p.name+" "+p.category).toLowerCase().includes(query.toLowerCase())),[query]);
 const money=(n:number)=>new Intl.NumberFormat("en-NG",{style:"currency",currency:"NGN",maximumFractionDigits:0}).format(n);
 const add=(p:Product)=>setCart(c=>{const x=c.find(i=>i.id===p.id);return x?c.map(i=>i.id===p.id?{...i,qty:i.qty+1}:i):[...c,{...p,qty:1}]});
 const total=cart.reduce((s,i)=>s+i.price*i.qty,0);
 const count=cart.reduce((s,i)=>s+i.qty,0);
 return <main>
  <header><div className="brand">VEYLOLA</div><div className="tag">Shop smart. Sell smarter.</div><button onClick={()=>setOpen(true)}>Cart ({count})</button></header>
  <section className="hero"><div><span className="pill">NEW DROPS</span><h1>Products people<br/><em>want to buy.</em></h1><p>Trending products with simple ordering and delivery.</p><a href="#products">Shop now →</a></div></section>
  <section className="toolbar"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search products..." /><span>{shown.length} products</span></section>
  <section id="products" className="grid">{shown.map(p=><article className="card" key={p.id}><img src={p.image} alt={p.name}/><div className="info"><small>{p.category}</small><h2>{p.name}</h2><strong>{money(p.price)}</strong><button onClick={()=>add(p)}>Add to cart</button></div></article>)}</section>
  {open&&<div className="overlay" onClick={()=>setOpen(false)}><aside className="drawer" onClick={e=>e.stopPropagation()}><div className="drawerHead"><h2>Your cart</h2><button className="close" onClick={()=>setOpen(false)}>×</button></div>{cart.length===0?<p>Your cart is empty.</p>:<>{cart.map(i=><div className="cartRow" key={i.id}><img src={i.image} alt=""/><div><b>{i.name}</b><small>{money(i.price)} × {i.qty}</small><div><button onClick={()=>setCart(c=>i.qty>1?c.map(x=>x.id===i.id?{...x,qty:x.qty-1}:x):c.filter(x=>x.id!==i.id))}>−</button><button onClick={()=>add(i)}>+</button></div></div></div>)}<div className="total"><span>Total</span><b>{money(total)}</b></div><button className="checkout" onClick={()=>alert("Checkout is ready for payment integration.")}>Continue to checkout</button></>}</aside></div>}
 </main>
}