"use client";

import { useEffect, useState } from "react";
import { createClient, User } from "@supabase/supabase-js";

type Product={id:string;name:string;category:string;price:string;image:string;description:string;affiliate_url:string;published:boolean};
const supabase=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL||"",process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||"");
const blank={name:"",category:"Tech",price:"",image:"",description:"",affiliate_url:"",published:true};

export default function Admin(){
 const [user,setUser]=useState<User|null>(null),[products,setProducts]=useState<Product[]>([]),[form,setForm]=useState(blank),[editing,setEditing]=useState<string|null>(null),[email,setEmail]=useState(""),[password,setPassword]=useState(""),[busy,setBusy]=useState(false),[message,setMessage]=useState("");

 useEffect(()=>{supabase.auth.getUser().then(({data})=>setUser(data.user)); const {data}=supabase.auth.onAuthStateChange((_e,s)=>setUser(s?.user??null)); return()=>data.subscription.unsubscribe()},[]);
 useEffect(()=>{if(user) load()},[user]);

 async function load(){const {data,error}=await supabase.from("products").select("*").order("created_at",{ascending:false}); if(error)setMessage(error.message); else setProducts(data||[])}
 async function login(e:React.FormEvent){e.preventDefault();setBusy(true);setMessage("");const {error}=await supabase.auth.signInWithPassword({email,password});if(error)setMessage(error.message);setBusy(false)}
 async function save(e:React.FormEvent){e.preventDefault();setBusy(true);setMessage("");const payload={...form,price:form.price.trim(),affiliate_url:form.affiliate_url.trim()};const result=editing?await supabase.from("products").update(payload).eq("id",editing):await supabase.from("products").insert(payload);if(result.error)setMessage(result.error.message);else{setMessage(editing?"Product updated ✓":"Product published ✓");setForm(blank);setEditing(null);await load()}setBusy(false)}
 async function remove(id:string){if(!confirm("Delete this product?"))return;const {error}=await supabase.from("products").delete().eq("id",id);if(error)setMessage(error.message);else await load()}
 function edit(p:Product){setEditing(p.id);setForm({name:p.name,category:p.category,price:p.price,image:p.image,description:p.description,affiliate_url:p.affiliate_url,published:p.published});window.scrollTo({top:0,behavior:"smooth"})}
 if(!user)return <main className="login"><form className="panel" onSubmit={login}><div className="logo">V</div><h1>Veylola Admin</h1><p>Sign in with the Supabase admin user created for this store.</p><input type="email" placeholder="Admin email" value={email} onChange={e=>setEmail(e.target.value)} required/><input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required/><button disabled={busy}>{busy?"Signing in…":"Sign in"}</button>{message&&<div className="message error">{message}</div>}</form></main>;
 return <main><nav><div className="navbrand"><span className="logo">V</span><strong>Veylola Admin</strong></div><div><a href="https://veylola-shop.onrender.com" target="_blank">Open store ↗</a><button className="ghost" onClick={()=>supabase.auth.signOut()}>Sign out</button></div></nav>
 <div className="dashboard">
  <form className="panel" onSubmit={save}><small>{editing?"EDIT PRODUCT":"PUBLISH PRODUCT"}</small><h1>{editing?"Update product":"Add a product"}</h1><p>Paste the product image URL and your AliExpress affiliate URL.</p>
   <input placeholder="Product name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/>
   <input placeholder="Category" value={form.category} onChange={e=>setForm({...form,category:e.target.value})} required/>
   <input placeholder="Price e.g. ₦24,900" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} required/>
   <input placeholder="Image URL (https://...)" value={form.image} onChange={e=>setForm({...form,image:e.target.value})} required/>
   <textarea placeholder="Short product description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
   <input type="url" placeholder="AliExpress affiliate URL" value={form.affiliate_url} onChange={e=>setForm({...form,affiliate_url:e.target.value})} required/>
   <label className="check"><input type="checkbox" checked={form.published} onChange={e=>setForm({...form,published:e.target.checked})}/> Publish on customer store</label>
   <button disabled={busy}>{busy?"Saving…":editing?"Update product":"Publish product"}</button>{editing&&<button type="button" className="ghost wide" onClick={()=>{setEditing(null);setForm(blank)}}>Cancel edit</button>}{message&&<div className="message">{message}</div>}
  </form>
  <section><div className="listHead"><div><small>CATALOG</small><h2>{products.length} Products</h2></div><button className="ghost" onClick={load}>Refresh</button></div><div className="list">{products.map(p=><article key={p.id}><div className="thumb">{p.image&&<img src={p.image} alt=""/>}</div><div className="info"><strong>{p.name}</strong><span>{p.category} • {p.price} • {p.published?"Published":"Hidden"}</span></div><div><button onClick={()=>edit(p)}>Edit</button><button className="danger" onClick={()=>remove(p.id)}>Delete</button></div></article>)}{!products.length&&<div className="message">No products yet. Add your first product.</div>}</div></section>
 </div></main>
}