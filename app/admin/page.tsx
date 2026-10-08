"use client";

import { useEffect, useState } from "react";
import { createClient, type User } from "@supabase/supabase-js";

type Product = {
  id: string;
  name: string;
  category: string;
  price: number | string;
  image: string | null;
  image_urls?: string[] | null;
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
  const [imageFiles, setImageFiles] = useState<File[]>([]);

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
    setImageFiles([]);
  }

  async function uploadProductImage(file: File) {
    if (!supabase) throw new Error("Supabase is not configured.");
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });
    if (error) throw error;
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    return data.publicUrl;
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

    try {
      let imageUrl = form.image.trim() || null;
      if (imageFiles.length > 0 && (imageFiles.length < 3 || imageFiles.length > 10)) throw new Error("Please choose between 3 and 10 images.");
      const uploadedImages = imageFiles.length > 0 ? await Promise.all(imageFiles.map(uploadProductImage)) : [];
      if (uploadedImages.length > 0) imageUrl = uploadedImages[0];

      const payload = {
        name: form.name.trim(),
        category: form.category.trim() || "Featured",
        price: Number(form.price),
        image: imageUrl,
        image_urls: uploadedImages.length > 0 ? uploadedImages : (form.image ? [form.image] : []),
      description: form.description.trim() || null,
      affiliate_url: form.affiliate_url.trim() || null,
      published: form.published,
    };

      const result = editingId
        ? await supabase.from("products").update(payload).eq("id", editingId)
        : await supabase.from("products").insert(payload);

      if (result.error) throw result.error;

      setMessage(editingId ? "Product updated successfully." : "Product added successfully.");
      resetForm();
      loadProducts();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not upload/save product.");
    } finally {
      setLoading(false);
    }
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
      <main className="center loginPage">
        <div className="loginGlow glowOne" /><div className="loginGlow glowTwo" /><div className="loginGlow glowThree" />
        <form className="card login loginGlass" onSubmit={login}>
          <div className="loginTop"><div className="logo loginLogo">V</div><div className="statusDot">● Secure</div></div>
          <p className="eyebrow">VEYLOLA • ADMIN</p>
          <h1>Welcome back<span>.</span></h1>
          <p className="muted">Sign in to manage your store, products and affiliate offers.</p>
          <label className="loginLabel">Email<input className="loginInput" type="email" placeholder="admin@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
          <label className="loginLabel">Password<input className="loginInput" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
          <button className="loginButton" disabled={loading}><span>{loading ? "Signing in..." : "Sign in to Veylola"}</span><b>→</b></button>
          {message && <div className="message error">{message}</div>}
          <div className="loginFooter"><span>🔒 Protected admin access</span><span>Veylola</span></div>
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
            <label>Price (₦)<input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="19999" required /></label>
            <label>Product images (3–10)<div className="uploadBox"><input className="fileInput" type="file" multiple accept="image/png,image/jpeg,image/webp,image/gif" onChange={(e) => setImageFiles(Array.from(e.target.files || []).slice(0, 10))} /><span>{imageFiles.length ? `${imageFiles.length} image${imageFiles.length === 1 ? "" : "s"} selected` : form.image ? "Current image saved · choose 3–10 new images to replace them" : "Choose 3–10 images from your phone"}</span></div><small className="uploadHint">Select 3 to 10 photos. The first image becomes the main product photo.</small></label>
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

      <style jsx>{`*{box-sizing:border-box}body{margin:0}
main{min-height:100vh;background:linear-gradient(135deg,#eef4ff 0%,#faf2ff 45%,#eafff8 100%);color:#172033;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;position:relative;overflow:hidden}
main:before,main:after{content:"";position:fixed;border-radius:50%;filter:blur(60px);opacity:.42;pointer-events:none;z-index:0}
main:before{width:320px;height:320px;background:#8db9ff;top:40px;left:-120px}main:after{width:360px;height:360px;background:#e39cff;right:-130px;top:230px}
.topbar{height:72px;background:rgba(255,255,255,.58);border:1px solid rgba(255,255,255,.8);box-shadow:0 18px 55px rgba(80,70,130,.12),inset 0 1px 0 #fff;backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);padding:0 6%;display:flex;align-items:center;justify-content:space-between;position:sticky;top:14px;margin:14px 18px 0;border-radius:22px;z-index:10}
.brand,.actions{display:flex;align-items:center;gap:12px}.brand{font-weight:800}.actions a{color:#26304a;text-decoration:none;font-weight:800;font-size:14px}
.logo{width:50px;height:50px;border-radius:17px;background:linear-gradient(135deg,#6258ff,#c04fff,#20caa8);color:#fff;display:grid;place-items:center;font-weight:950;font-size:23px;box-shadow:0 10px 25px rgba(100,80,230,.3)}.logo.small{width:36px;height:36px;border-radius:12px;font-size:16px}
.wrap{max-width:1120px;margin:auto;padding:50px 22px 90px;position:relative;z-index:1}.hero{display:flex;align-items:end;justify-content:space-between;gap:25px;margin-bottom:26px}.eyebrow{font-size:11px;letter-spacing:2px;font-weight:900;color:#68708a;margin:0 0 9px}
h1{font-size:clamp(40px,7vw,68px);letter-spacing:-4px;line-height:.98;margin:0 0 15px}h1 span{background:linear-gradient(90deg,#665cff,#c54fff,#16c7a1);-webkit-background-clip:text;background-clip:text;color:transparent}h2{font-size:30px;letter-spacing:-1.3px;margin:0}.muted{color:#697287;line-height:1.65}
.card{background:rgba(255,255,255,.58);border:1px solid rgba(255,255,255,.8);border-radius:26px;box-shadow:0 20px 60px rgba(75,65,120,.12),inset 0 1px 0 rgba(255,255,255,.9);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);padding:28px}
.formGrid{display:grid;grid-template-columns:1fr 1fr;gap:17px}label{display:flex;flex-direction:column;gap:8px;font-size:13px;font-weight:800;color:#394158}.wide{grid-column:1/-1}
input,textarea{width:100%;border:1px solid rgba(125,130,160,.22);border-radius:15px;padding:14px;background:rgba(255,255,255,.66);font:inherit;font-weight:500;outline:none;color:#172033;box-shadow:inset 0 2px 8px rgba(70,70,100,.04)}input:focus,textarea:focus{border-color:#8176ff;box-shadow:0 0 0 4px rgba(129,118,255,.13)}
.check{margin-top:18px;display:flex;flex-direction:row;align-items:center;gap:9px}.check input{width:auto;accent-color:#7166ff}.buttons{display:flex;gap:10px;margin-top:20px}
button{border:0;border-radius:14px;background:linear-gradient(135deg,#6258ff,#b653ff);color:white;padding:13px 18px;font-weight:900;cursor:pointer;box-shadow:0 10px 24px rgba(100,82,230,.22)}button:disabled{opacity:.6}.secondary{background:rgba(255,255,255,.72);color:#343c55;box-shadow:none;border:1px solid rgba(100,100,130,.12)}.danger{background:rgba(255,95,120,.13);color:#c62d55;box-shadow:none}
.uploadHint{font-size:11px;color:#7b8295;font-weight:700}.message{margin-top:15px;padding:12px 14px;border-radius:14px;background:rgba(255,255,255,.65);font-size:14px}.error{background:#ffe8ee;color:#ad1f4a}
.list{margin-top:50px}.sectionHead{display:flex;justify-content:space-between;align-items:end;margin-bottom:17px}.table{display:flex;flex-direction:column;gap:11px}.row{background:rgba(255,255,255,.55);border:1px solid rgba(255,255,255,.8);box-shadow:0 14px 40px rgba(75,65,120,.09),inset 0 1px 0 #fff;backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-radius:22px;padding:13px;display:flex;align-items:center;gap:15px}
.thumb{width:76px;height:76px;border-radius:18px;overflow:hidden;background:linear-gradient(135deg,#dfe5ff,#f7ddff);display:grid;place-items:center;font-weight:950;font-size:24px;color:#675eff;flex:none}.thumb img{width:100%;height:100%;object-fit:cover}.info{flex:1;display:flex;flex-direction:column;gap:5px}.info span,.info small{color:#70788d;font-size:12px}.rowActions{display:flex;gap:7px;flex-wrap:wrap}.rowActions button{font-size:12px;padding:9px 11px}.empty{text-align:center;color:#737b90}
.center{display:grid;place-items:center;padding:20px}.loginPage{min-height:100vh!important;background:radial-gradient(circle at 20% 20%,rgba(111,94,255,.22),transparent 30%),radial-gradient(circle at 85% 30%,rgba(224,76,255,.2),transparent 28%),radial-gradient(circle at 55% 90%,rgba(25,211,176,.18),transparent 30%),linear-gradient(135deg,#eaf0ff,#fbf2ff 48%,#e9fff8);overflow:hidden}.loginGlow{position:absolute;border-radius:50%;filter:blur(35px);pointer-events:none}.glowOne{width:190px;height:190px;background:rgba(101,88,255,.34);top:12%;left:8%}.glowTwo{width:230px;height:230px;background:rgba(220,72,255,.28);right:5%;top:22%}.glowThree{width:170px;height:170px;background:rgba(24,205,170,.25);bottom:8%;left:20%}.loginGlass{position:relative;z-index:2;width:min(455px,100%);padding:34px;border-radius:32px;background:linear-gradient(145deg,rgba(255,255,255,.72),rgba(255,255,255,.38));border:1px solid rgba(255,255,255,.88);box-shadow:0 35px 100px rgba(68,54,130,.22),inset 0 1px 0 rgba(255,255,255,.98),inset 0 -1px 0 rgba(120,100,200,.08);backdrop-filter:blur(32px);-webkit-backdrop-filter:blur(32px)}.loginTop{display:flex;align-items:center;justify-content:space-between;margin-bottom:22px}.loginLogo{width:66px;height:66px;border-radius:21px;font-size:29px;box-shadow:0 16px 35px rgba(102,76,240,.3)}.statusDot{font-size:12px;font-weight:900;color:#168d76;background:rgba(32,205,165,.12);border:1px solid rgba(32,205,165,.2);padding:8px 11px;border-radius:999px}.login h1{font-size:clamp(43px,10vw,58px);margin-bottom:10px}.login h1 span{background:linear-gradient(90deg,#655bff,#d04bff,#19c9a6);-webkit-background-clip:text;background-clip:text;color:transparent}.loginLabel{margin-top:17px}.loginInput{margin-top:0!important;background:rgba(255,255,255,.68);border:1px solid rgba(115,100,180,.16);box-shadow:inset 0 1px 0 rgba(255,255,255,.9),0 8px 24px rgba(75,65,120,.05)}.loginInput:focus{border-color:#786cff;box-shadow:0 0 0 4px rgba(120,108,255,.12),0 10px 30px rgba(90,70,180,.08)}.loginButton{width:100%;margin-top:20px!important;padding:15px 18px;display:flex;align-items:center;justify-content:space-between;background:linear-gradient(100deg,#5d5aff,#9d52ff 55%,#18c8a5);box-shadow:0 16px 32px rgba(99,78,230,.25)}.loginButton b{font-size:22px}.loginFooter{display:flex;justify-content:space-between;gap:10px;margin-top:20px;padding-top:16px;border-top:1px solid rgba(100,100,140,.12);color:#788096;font-size:11px;font-weight:800}.login .error{background:rgba(255,230,237,.78);border:1px solid rgba(220,80,110,.12)}.login h1{font-size:42px;letter-spacing:-2px}.login input{margin-top:12px}.login button{width:100%;margin-top:15px}
@media(max-width:700px){.formGrid{grid-template-columns:1fr}.wide{grid-column:auto}.hero{align-items:flex-start;flex-direction:column}.row{align-items:flex-start;flex-wrap:wrap}.rowActions{width:100%}.topbar{margin:10px 10px 0;padding:0 14px}.actions a{display:none}.wrap{padding:35px 15px 60px}h1{letter-spacing:-2.5px}.card{padding:20px}}`}</style>
    </main>
  );
}
