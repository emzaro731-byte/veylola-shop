"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type Product={id:string;name:string;category:string;price:string;image:string;description:string;affiliate_url:string};

const supabase=createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export default function Home(){
  const [products,setProducts]=useState<Product[]>([]);
  const [query,setQuery]=useState("");
  const [category,setCategory]=useState("All");
  const [cart,setCart]=useState<Product[]>([]);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    const saved=localStorage.getItem("veylola-cart");
    if(saved) setCart(JSON.parse(saved));
    (async()=>{
      const {data}=await supabase.from("products").select("*").eq("published",true).order("created_at",{ascending:false});
      setProducts((data||[]) as Product[]);
      setLoading(false);
    })();
  },[]);

  useEffect(()=>localStorage.setItem("veylola-cart",JSON.stringify(cart)),[cart]);

  const categories=["All",...Array.from(new Set(products.map(p=>p.category).filter(Boolean)))];
  const filtered=useMemo(()=>products.filter(p=>{
    const matchesCategory=category==="All"||p.category===category;
    const q=query.toLowerCase().trim();
    return matchesCategory && (!q || [p.name,p.category,p.description].join(" ").toLowerCase().includes(q));
  }),[products,query,category]);

  function addToCart(p:Product){
    setCart(c=>c.some(x=>x.id===p.id)?c:[...c,p]);
  }
  function removeFromCart(id:string){setCart(c=>c.filter(x=>x.id!==id));}

  return <main>
    <nav className="nav">
      <a className="brand" href="#"><span className="mark">V</span><span>Veylola</span></a>
      <div className="navActions"><a href="#deals">Shop</a><a href="#about">About</a><button className="cartBtn" onClick={()=>document.getElementById("cart")?.scrollIntoView({behavior:"smooth"})}>Cart ({cart.length})</button></div>
    </nav>

    <section className="hero">
      <div>
        <small>CURATED FINDS • SMART SHOPPING</small>
        <h1>Discover products<br/><span>worth clicking.</span></h1>
        <p>Useful, stylish and trending finds selected for the Veylola community.</p>
        <a className="primary" href="#deals">Explore products →</a>
      </div>
      <div className="heroBox"><div className="heroIcon">✦</div><strong>Fresh finds, one place.</strong><span>Discover products and follow the deal link when you're ready to buy.</span></div>
    </section>

    <section id="deals" className="deals">
      <div className="head"><div><small>VE YLOLA SHOP</small><h2>Featured finds</h2></div><span>{products.length} published product{products.length===1?"":"s"}</span></div>
      <div className="toolbar"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search products..." aria-label="Search products"/><div className="chips">{categories.map(c=><button key={c} className={category===c?"active":""} onClick={()=>setCategory(c)}>{c}</button>)}</div></div>

      {loading?<div className="empty">Loading products…</div>:!filtered.length?<div className="empty"><strong>No products found.</strong><span>Publish products from the Veylola Admin dashboard.</span></div>:
      <div className="grid">{filtered.map(p=><article className="card" key={p.id}>
        <div className="pic">{p.image?<img src={p.image} alt={p.name} loading="lazy"/>:<div className="noImage">Veylola</div>}<b>{p.category}</b></div>
        <div className="body"><h3>{p.name}</h3><p>{p.description}</p><div className="foot"><strong>{p.price}</strong><button onClick={()=>addToCart(p)}>{cart.some(x=>x.id===p.id)?"Added ✓":"Add to cart"}</button></div><a className="deal" href={p.affiliate_url} target="_blank" rel="nofollow sponsored noopener">View deal ↗</a></div>
      </article>)}</div>}
    </section>

    <section id="cart" className="cartSection"><div><small>YOUR PICKS</small><h2>Shopping list</h2></div>{!cart.length?<p className="muted">Your cart is empty. Add products above.</p>:<div className="cartList">{cart.map(p=><div className="cartItem" key={p.id}><span>{p.name}</span><strong>{p.price}</strong><button onClick={()=>removeFromCart(p.id)}>Remove</button></div>)}<p className="muted">Veylola uses affiliate deal links. Checkout and payment are completed on the linked merchant site.</p></div>}</section>

    <section id="about" className="notice"><strong>Affiliate disclosure</strong><p>Some Veylola links are affiliate links. We may earn a commission if you purchase through them, at no extra cost to you. Prices and availability can change on the merchant site.</p></section>
    <footer>Veylola © {new Date().getFullYear()} • Smart shopping, simply.</footer>
  </main>
}