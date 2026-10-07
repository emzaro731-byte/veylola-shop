"use client";

import { useMemo, useState } from "react";

type Product = { id:number; name:string; category:string; price:number; supplierPrice:number; image:string };

const products: Product[] = [
  {id:1,name:"Magnetic Phone Holder",category:"Phone Accessories",price:12900,supplierPrice:6500,image:"https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=800&q=80"},
  {id:2,name:"Mini Portable Blender",category:"Home & Kitchen",price:21900,supplierPrice:11800,image:"https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=800&q=80"},
  {id:3,name:"Smart LED Desk Lamp",category:"Home & Office",price:18500,supplierPrice:9200,image:"https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80"},
  {id:4,name:"Wireless Earbuds Case",category:"Electronics",price:9900,supplierPrice:4200,image:"https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=800&q=80"}
];

export default function Home(){
 const [query,setQuery]=useState(""); const [cart,setCart]=useState<Product[]>([]);
 const shown=useMemo(()=>products.filter(p=>(p.name+" "+p.category).toLowerCase().includes(query.toLowerCase())),[query]);
 const money=(n:number)=>new Intl.NumberFormat("en-NG",{style:"currency",currency:"NGN",maximumFractionDigits:0}).format(n);
 return <main>
  <header><div className="brand">VEYLOLA</div><div className="tag">Shop smart. Sell smarter.</div><button onClick={()=>alert(`Cart: ${cart.length} item(s)`)}>Cart ({cart.length})</button></header>
  <section className="hero"><div><span className="pill">NEW DROPS</span><h1>Products people<br/><em>want to buy.</em></h1><p>Discover trending products with fast, simple ordering.</p><a href="#products">Shop now →</a></div></section>
  <section className="toolbar"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search products..." /><span>{shown.length} products</span></section>
  <section id="products" className="grid">{shown.map(p=><article className="card" key={p.id}><img src={p.image} alt={p.name}/><div className="info"><small>{p.category}</small><h2>{p.name}</h2><strong>{money(p.price)}</strong><button onClick={()=>setCart([...cart,p])}>Add to cart</button></div></article>)}</section>
 </main>
}