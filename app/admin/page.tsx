"use client";

import { useEffect, useState } from "react";
import { createClient, type User } from "@supabase/supabase-js";

type Product = {
  id: string;
  name: string;
  category: string;
  price: number | string;
  image: string | null;
  description: string | null;
  affiliate_url: string | null;
  published: boolean;
  created_at: string;
};

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = url && key ? createClient(url, key) : null;

const emptyForm = {
  name: "",
  category: "Featured",
  price: "",
  image: "",
  description: "",
  affiliate_url: "",
  published: true,
};

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) loadProducts();
  }, [user]);

  async function loadProducts() {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) setMessage(error.message);
    else setProducts((data || []) as Product[]);
  }

  async function login(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return setMessage("Supabase environment variables are missing.");
    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setMessage(error.message);
  }

  async function logout() {
    await supabase?.auth.signOut();
  }

  function editProduct(p: Product) {
    setEditingId(p.id);
    setForm({
      name: p.name,
      category: p.category || "Featured",
      price: String(p.price ?? ""),
      image: p.image || "",
      description: p.description || "",
      affiliate_url: p.affiliate_url || "",
      published: p.published,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function saveProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    if (!form.name.trim() || !form.price.trim()) {
      setMessage("Product name and price are required.");
      return;
    }

    setLoading(true);
    setMessage("");

    const payload = {
      name: form.name.trim(),
      category: form.category.trim() || "Featured",
      price: Number(form.price),
      image: form.image.trim() || null,
      description: form.description.trim() || null,
      affiliate_url: form.affiliate_url.trim() || null,
      published: form.published,
    };

    const result = editingId
      ? await supabase.from("products").update(payload).eq("id", editingId)
      : await supabase.from("products").insert(payload);

    setLoading(false);

    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    setMessage(editingId ? "Product updated successfully." : "Product added successfully.");
    resetForm();
    loadProducts();
  }

  async function deleteProduct(id: string) {
    if (!supabase || !confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) setMessage(error.message);
    else {
      setMessage("Product deleted.");
      loadProducts();
    }
  }

  async function togglePublished(p: Product) {
    if (!supabase) return;
    const { error } = await supabase
      .from("products")
      .update({ published: !p.published })
      .eq("id", p.id);
    if (error) setMessage(error.message);
    else loadProducts();
  }

  if (!supabase) {
    return <main className="center"><div className="card"><h1>Veylola Admin</h1><p>Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Render, then redeploy.</p></div></main>;
  }

  if (!user) {
    return (
      <main className="center">
        <form className="card login" onSubmit={login}>
          <div className="logo">V</div>
          <p className="eyebrow">VEYLOLA FINDS</p>
          <h1>Admin dashboard</h1>
          <p className="muted">Sign in to add and manage products.</p>
          <input type="email" placeholder="Admin email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button disabled={loading}>{loading ? "Signing in..." : "Sign in"}</button>
          {message && <div className="message error">{message}</div>}
        </form>
      </main>
    );
  }

  return (
    <main>
      <header className="topbar">
        <div className="brand"><span className="logo small">V</span><span>Veylola Admin</span></div>
        <div className="actions"><a href="/">View store</a><button className="secondary" onClick={logout}>Sign out</button></div>
      </header>

      <div className="wrap">
        <section className="hero">
          <div><p className="eyebrow">STORE MANAGEMENT</p><h1>{editingId ? "Edit product" : "Add a product"}</h1><p className="muted">Add your AliExpress affiliate products and publish them instantly.</p></div>
        </section>

        <form className="card form" onSubmit={saveProduct}>
          <div className="formGrid">
            <label>Product name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Wireless Bluetooth Earbuds" required /></label>
            <label>Category<input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Electronics" /></label>
            <label>Price<input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="19.99" required /></label>
            <label>Product image URL<input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." /></label>
            <label className="wide">AliExpress affiliate URL<input value={form.affiliate_url} onChange={(e) => setForm({ ...form, affiliate_url: e.target.value })} placeholder="https://s.click.aliexpress.com/..." /></label>
            <label className="wide">Description<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Short product description" rows={4} /></label>
          </div>
          <label className="check"><input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} /> Publish this product</label>
          <div className="buttons"><button disabled={loading}>{loading ? "Saving..." : editingId ? "Update product" : "Add product"}</button>{editingId && <button type="button" className="secondary" onClick={resetForm}>Cancel</button>}</div>
          {message && <div className="message">{message}</div>}
        </form>

        <section className="list">
          <div className="sectionHead"><div><p className="eyebrow">CATALOG</p><h2>Your products ({products.length})</h2></div></div>
          {products.length === 0 ? <div className="card empty">No products yet. Add your first product above.</div> : (
            <div className="table">
              {products.map((p) => (
                <article className="row" key={p.id}>
                  <div className="thumb">{p.image ? <img src={p.image} alt="" /> : <span>V</span>}</div>
                  <div className="info"><strong>{p.name}</strong><span>{p.category} · {Number(p.price).toFixed(2)}</span><small>{p.published ? "Published" : "Hidden"}</small></div>
                  <div className="rowActions"><button className="secondary" onClick={() => togglePublished(p)}>{p.published ? "Hide" : "Publish"}</button><button className="secondary" onClick={() => editProduct(p)}>Edit</button><button className="danger" onClick={() => deleteProduct(p.id)}>Delete</button></div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      <style jsx>{`
        *{box-sizing:border-box} body{margin:0}
        main{min-height:100vh;background:#f6f6f3;color:#111;font-family:Arial,Helvetica,sans-serif}
        .topbar{height:70px;background:#fff;border-bottom:1px solid #e5e5e5;padding:0 6%;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:10}
        .brand,.actions{display:flex;align-items:center;gap:12px}.brand{font-weight:800}.actions a{color:#111;text-decoration:none;font-weight:700;font-size:14px}
        .logo{width:48px;height:48px;border-radius:14px;background:#111;color:#fff;display:grid;place-items:center;font-weight:900;font-size:22px}.logo.small{width:34px;height:34px;border-radius:10px;font-size:16px}
        .wrap{max-width:1100px;margin:auto;padding:45px 22px 80px}.hero{margin-bottom:25px}.eyebrow{font-size:11px;letter-spacing:2px;font-weight:800;color:#777;margin:0 0 8px}h1{font-size:clamp(35px,6vw,58px);letter-spacing:-3px;margin:0 0 12px}h2{font-size:30px;letter-spacing:-1px;margin:0}.muted{color:#777;line-height:1.6}
        .card{background:#fff;border:1px solid #e5e5e5;border-radius:20px;padding:26px;box-shadow:0 12px 35px rgba(0,0,0,.05)}
        .formGrid{display:grid;grid-template-columns:1fr 1fr;gap:18px}label{display:flex;flex-direction:column;gap:8px;font-size:13px;font-weight:700}.wide{grid-column:1/-1}
        input,textarea{width:100%;border:1px solid #ddd;border-radius:10px;padding:13px;font:inherit;font-weight:400;outline:none;background:#fff}input:focus,textarea:focus{border-color:#111}
        .check{margin-top:18px;display:flex;flex-direction:row;align-items:center;gap:9px;font-weight:600}.check input{width:auto}
        button{border:0;border-radius:10px;background:#111;color:#fff;padding:12px 17px;font-weight:800;cursor:pointer}.buttons{display:flex;gap:10px;margin-top:20px}.secondary{background:#eee;color:#111}.danger{background:#ffe9e9;color:#a40000}
        .message{margin-top:15px;padding:12px;border-radius:10px;background:#f0f0ee;font-size:14px}.error{background:#ffe9e9;color:#a40000}
        .list{margin-top:50px}.sectionHead{margin-bottom:18px}.table{display:flex;flex-direction:column;gap:10px}.row{background:#fff;border:1px solid #e5e5e5;border-radius:16px;padding:12px;display:flex;align-items:center;gap:15px}.thumb{width:70px;height:70px;border-radius:12px;overflow:hidden;background:#eee;display:grid;place-items:center;font-weight:900}.thumb img{width:100%;height:100%;object-fit:cover}.info{flex:1;display:flex;flex-direction:column;gap:5px}.info span,.info small{color:#777;font-size:12px}.rowActions{display:flex;gap:7px;flex-wrap:wrap}.rowActions button{font-size:12px;padding:9px 11px}.empty{text-align:center;color:#777}
        .center{display:grid;place-items:center;padding:20px}.login{width:min(430px,100%)}.login h1{font-size:38px}.login input{margin-top:12px}.login button{width:100%;margin-top:15px}
        @media(max-width:700px){.formGrid{grid-template-columns:1fr}.wide{grid-column:auto}.row{align-items:flex-start;flex-wrap:wrap}.rowActions{width:100%}.topbar{padding:0 18px}.actions a{display:none}.wrap{padding:30px 16px 60px}}
      `}</style>
    </main>
  );
}
