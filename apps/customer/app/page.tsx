"use client";
import {useEffect,useState} from "react";
import {createClient} from "@supabase/supabase-js";
type Product={id:string;name:string;category:string;price:string;image:string;description:string;affiliate_url:string};
export default function Home(){
 const [products,setProducts]=useState<Product[]>([]);
 useEffect(()=>{
  const supabase=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  supabase.from("products").select("*").eq("published",true).order("created_at",{ascending:false}).then(({data})=>setProducts(data||[]));
 },[]);
 return <main><nav className="nav"><div className="brand"><span className="mark">V</span>Veylola Finds</div><a className="cta" href="#deals">Explore deals</a></nav>
 <section className="hero"><div><small>CURATED FINDS • SMART SHOPPING</small><h1>Discover products<br/><span>worth clicking.</span></h1><p>Useful, stylish and trending finds in one simple place.</p><a className="primary" href="#deals">Browse featured finds →</a></div><div className="heroBox">🛍️<strong>New finds every week</strong><span>Shop through our trusted AliExpress affiliate links.</span></div></section>
 <section id="deals" className="deals"><div className="head"><div><small>EDITOR'S PICKS</small><h2>Trending finds</h2></div><span>Prices may change on AliExpress.</span></div><div className="grid">{products.map(p=><article className="card" key={p.id}><div className="pic"><img src={p.image} alt={p.name}/><b>{p.category}</b></div><div className="body"><h3>{p.name}</h3><p>{p.description}</p><div className="foot"><strong>{p.price}</strong><a href={p.affiliate_url} target="_blank" rel="nofollow sponsored noopener">View deal ↗</a></div></div></article>)}</div>{!products.length&&<div className="empty">No products published yet. Check back soon.</div>}</section>
 <section className="notice"><strong>Affiliate disclosure</strong><p>Some links are affiliate links. We may earn a commission if you purchase through them, at no extra cost to you.</p></section><footer>Veylola Finds © 2026</footer></main>}