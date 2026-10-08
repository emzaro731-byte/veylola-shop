"use client";

import { useEffect, useState } from "react";
import { createClient, User } from "@supabase/supabase-js";

type Product={id:string;name:string;category:string;price:string;image:string;description:string;affiliate_url:string;published:boolean};
type Category={id:string;name:string;image_url:string;description:string;featured:boolean;active:boolean;sort_order:number};

const supabase=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL||"",process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||"");
const DEFAULT_CATEGORIES=["Electronics","Phones & Accessories","Computers & Accessories","Fashion","Beauty & Personal Care","Home & Garden","Home Appliances","Kitchen","Health & Fitness","Sports & Outdoors","Baby & Kids","Shoes & Bags","Jewelry & Accessories","Automotive","Office & School","Gaming","Groceries","Other"];
const blank={name:"",category:"Electronics",price:"",image:"",description:"",affiliate_url:"",published:true};
const DRAFT_KEY="veylola-admin-product-draft-v3";

export default function Admin(){
 const [user,setUser]=useState<User|null>(null),[products,setProducts]=useState<Product[]>([]),[categories,setCategories]=useState<Category[]>([]),[form,setForm]=useState(blank),[editing,setEditing]=useState<string|null>(null),[email,setEmail]=useState(""),[password,setPassword]=useState(""),[busy,setBusy]=useState(false),[message,setMessage]=useState(""),[draftRestored,setDraftRestored]=useState(false);
 const [newCategory,setNewCategory]=useState(""),[newCategoryImage,setNewCategoryImage]=useState("");

 useEffect(()=>{supabase.auth.getUser().then(({data})=>setUser(data.user));const {data}=supabase.auth.onAuthStateChange((_e,s)=>setUser(s?.user??null));return()=>data.subscription.unsubscribe()},[]);
 useEffect(()=>{try{const saved=localStorage.getItem(DRAFT_KEY);if(saved){const d=JSON.parse(saved);if(d?.form){setForm({...blank,...d.form});setEditing(d.editing||null);setDraftRestored(true)}}}catch{}},[]);
 useEffect(()=>{try{const has=Object.entries(form).some(([k,v])=>k!=="published"&&String(v).trim()!=="");if(has||editing)localStorage.setItem(DRAFT_KEY,JSON.stringify({form,editing,savedAt:new Date().toISOString()}))}catch{}},[form,editing]);
 useEffect(()=>{if(user){load();loadCategories()}},[user]);

 async function load(){const {data,error}=await supabase.from("products").select("*").order("created_at",{ascending:false});if(error)setMessage(error.message);else setProducts(data||[])}
 async function loadCategories(){let {data,error}=await supabase.from("categories").select("*").order("sort_order",{ascending:true});if(error){setMessage(error.message);return}if(!data?.length){await seedCategories();return}setCategories(data||[])}
 async function seedCategories(){const rows=DEFAULT_CATEGORIES.map((name,i)=>({name,image_url:"",description:"",featured:i<6,active:true,sort_order:i}));const {error}=await supabase.from("categories").upsert(rows,{onConflict:"name"});if(error)setMessage(error.message);else{const {data}=await supabase.from("categories").select("*").order("sort_order");setCategories(data||[])}}
 async function login(e:React.FormEvent){e.preventDefault();setBusy(true);setMessage("");const {error}=await supabase.auth.signInWithPassword({email,password});if(error)setMessage(error.message);setBusy(false)}
 async function save(e:React.FormEvent){e.preventDefault();setBusy(true);setMessage("");const payload={...form,price:form.price.trim(),affiliate_url:form.affiliate_url.trim()};const result=editing?await supabase.from("products").update(payload).eq("id",editing):await supabase.from("products").insert(payload);if(result.error)setMessage(result.error.message);else{setMessage(editing?"Product updated ✓":"Product published ✓");setForm(blank);setEditing(null);try{localStorage.removeItem(DRAFT_KEY)}catch{}await load()}setBusy(false)}
 async function remove(id:string){if(!confirm("Delete this product?"))return;const {error}=await supabase.from("products").delete().eq("id",id);if(error)setMessage(error.message);else await load()}
 function edit(p:Product){setEditing(p.id);setForm({name:p.name,category:p.category,price:p.price,image:p.image,description:p.description,affiliate_url:p.affiliate_url,published:p.published});try{localStorage.setItem(DRAFT_KEY,JSON.stringify({form:{name:p.name,category:p.category,price:p.price,image:p.image,description:p.description,affiliate_url:p.affiliate_url,published:p.published},editing:p.id}))}catch{}window.scrollTo({top:0,behavior:"smooth"})}
 function clearDraft(){setEditing(null);setForm(blank);setDraftRestored(false);try{localStorage.removeItem(DRAFT_KEY)}catch{}}
 async function addCategory(e:React.FormEvent){e.preventDefault();const name=newCategory.trim();if(!name)return;const {error}=await supabase.from("categories").insert({name,image_url:newCategoryImage.trim(),featured:false,active:true,sort_order:categories.length});if(error)setMessage(error.message);else{setNewCategory("");setNewCategoryImage("");setMessage("Category added ✓");loadCategories()}}
 async function updateCategory(id:string,patch:Partial<Category>){const {error}=await supabase.from("categories").update(patch).eq("id",id);if(error)setMessage(error.message);else loadCategories()}
 async function deleteCategory(id:string){if(!confirm("Delete this category? Products using it will keep their category text."))return;const {error}=await supabase.from("categories").delete().eq("id",id);if(error)setMessage(error.message);else loadCategories()}

 if(!user)return <main className="login"><form className="panel" onSubmit={login}><div className="logo">V</div><h1>Veylola Admin</h1><p>Sign in with your Supabase admin user.</p><input type="email" placeholder="Admin email" value={email} onChange={e=>setEmail(e.target.value)} required/><input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required/><button disabled={busy}>{busy?"Signing in…":"Sign in"}</button>{message&&<div className="message error">{message}</div>}</form></main>;

 return <main><nav><div className="navbrand"><span className="logo">V</span><strong>Veylola Admin</strong></div><div><a href="https://veylola-shop.onrender.com" target="_blank">Open store ↗</a><button className="ghost" onClick={()=>supabase.auth.signOut()}>Sign out</button></div></nav>
 <div className="dashboard">
  <form className="panel" onSubmit={save}><small>{editing?"EDIT PRODUCT":"PUBLISH PRODUCT"}</small><h1>{editing?"Update product":"Add a product"}</h1><p>Your unfinished product draft is saved on this device automatically.</p>{draftRestored&&<div className="message">Your unfinished draft was restored ✓</div>}
   <input placeholder="Product name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/>
   <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{categories.filter(c=>c.active).map(c=><option key={c.id} value={c.name}>{c.name}</option>)}</select>
   <input placeholder="Price e.g. ₦24,900" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} required/>
   <input placeholder="Image URL (https://...)" value={form.image} onChange={e=>setForm({...form,image:e.target.value})} required/>
   <textarea placeholder="Short product description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
   <input type="url" placeholder="AliExpress affiliate URL" value={form.affiliate_url} onChange={e=>setForm({...form,affiliate_url:e.target.value})} required/>
   <label className="check"><input type="checkbox" checked={form.published} onChange={e=>setForm({...form,published:e.target.checked})}/> Publish on customer store</label>
   <button disabled={busy}>{busy?"Saving…":editing?"Update product":"Publish product"}</button>{(editing||draftRestored)&&<button type="button" className="ghost wide" onClick={clearDraft}>Clear draft / Cancel edit</button>}{message&&<div className="message">{message}</div>}
  </form>

  <section className="categoryPanel panel"><div className="listHead"><div><small>CUSTOMER CATEGORIES</small><h2>Category control</h2></div><button className="ghost" onClick={seedCategories}>Restore defaults</button></div>
   <p>Select <b>Featured</b> categories to control the Best Selected section on the customer website. Turn Active off to hide a category.</p>
   <form className="categoryAdd" onSubmit={addCategory}><input placeholder="New category name" value={newCategory} onChange={e=>setNewCategory(e.target.value)}/><input placeholder="Category image URL (optional)" value={newCategoryImage} onChange={e=>setNewCategoryImage(e.target.value)}/><button>Add category</button></form>
   <div className="categoryList">{categories.map((c,i)=><article className={!c.active?"inactive":""} key={c.id}><div className="catThumb">{c.image_url?<img src={c.image_url} alt=""/>:<span>V</span>}</div><div className="catInfo"><strong>{c.name}</strong><span>Order {i+1}</span></div><label className="toggle"><input type="checkbox" checked={c.featured} onChange={e=>updateCategory(c.id,{featured:e.target.checked})}/> Featured</label><label className="toggle"><input type="checkbox" checked={c.active} onChange={e=>updateCategory(c.id,{active:e.target.checked})}/> Active</label><div><button className="mini" disabled={i===0} onClick={()=>{if(i>0){const prev=categories[i-1];updateCategory(c.id,{sort_order:prev.sort_order-1});updateCategory(prev.id,{sort_order:c.sort_order})}}}>↑</button><button className="mini" disabled={i===categories.length-1} onClick={()=>{if(i<categories.length-1){const next=categories[i+1];updateCategory(c.id,{sort_order:next.sort_order+1});updateCategory(next.id,{sort_order:c.sort_order})}}}>↓</button><button className="mini danger" onClick={()=>deleteCategory(c.id)}>×</button></div></article>)}</div>
  </section>

  <section><div className="listHead"><div><small>CATALOG</small><h2>{products.length} Products</h2></div><button className="ghost" onClick={load}>Refresh</button></div><div className="list">{products.map(p=><article key={p.id}><div className="thumb">{p.image&&<img src={p.image} alt=""/></div><div className="info"><strong>{p.name}</strong><span>{p.category} • {p.price} • {p.published?"Published":"Hidden"}</span></div><div><button onClick={()=>edit(p)}>Edit</button><button className="danger" onClick={()=>remove(p.id)}>Delete</button></div></article>)}{!products.length&&<div className="message">No products yet.</div>}</div></section>
 </div></main>
}