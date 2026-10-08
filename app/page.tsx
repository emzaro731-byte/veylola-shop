"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type Product = {
  id: string;
  name: string;
  category: string;
  price: string;
  image: string;
  description: string;
  affiliate_url: string;
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase =
  SUPABASE_URL && SUPABASE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_KEY)
    : null;

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProducts() {
      if (!supabase) {
        setError(
          "Store database is not configured. Please add the Supabase environment variables in Render."
        );
        return;
      }

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
        return;
      }

      setProducts((data || []) as Product[]);
    }

    loadProducts();
  }, []);

  return (
    <main>
      <nav className="nav">
        <div className="brand">
          <span className="brandMark">V</span>
          <span>Veylola Finds</span>
        </div>

        <a className="navCta" href="#deals">
          Explore deals
        </a>
      </nav>

      <section className="hero">
        <div className="heroCopy">
          <div className="eyebrow">
            CURATED FINDS • SMART SHOPPING
          </div>

          <h1>
            Discover products
            <br />
            <span>worth clicking.</span>
          </h1>

          <p>
            Useful, stylish and trending finds in one simple place.
          </p>

          <div className="heroActions">
            <a className="primary" href="#deals">
              Browse featured finds →
            </a>
          </div>
        </div>

        <div className="heroCard">
          <div className="dealBadge">LIVE STORE</div>
          <div className="heroIcon">🛍️</div>

          <strong>New finds every week</strong>

          <span>
            Shop through our AliExpress affiliate links.
          </span>
        </div>
      </section>

      <section id="deals" className="deals">
        <div className="sectionHead">
          <div>
            <p className="sectionEyebrow">EDITOR'S PICKS</p>
            <h2>Trending finds</h2>
          </div>

          <span className="smallNote">
            Prices may change on AliExpress.
          </span>
        </div>

        {error && (
          <div className="empty error">
            {error}
          </div>
        )}

        <div className="grid">
          {products.map((p) => (
            <article className="product" key={p.id}>
              <div className="imageWrap">
                <img
                  src={p.image}
                  alt={p.name}
                  loading="lazy"
                />

                <span className="tag">
                  {p.category}
                </span>
              </div>

              <div className="productBody">
                <h3>{p.name}</h3>

                <p>{p.description}</p>

                <div className="productFoot">
                  <strong>{p.price}</strong>

                  <a
                    href={p.affiliate_url}
                    target="_blank"
                    rel="nofollow sponsored noopener"
                  >
                    View deal ↗
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>

        {!error && !products.length && (
          <div className="empty">
            No products published yet. Check back soon.
          </div>
        )}
      </section>

      <section className="disclosure">
        <strong>Affiliate disclosure</strong>

        <p>
          Some links on Veylola Finds are affiliate links.
          If you buy through one, we may earn a commission
          at no extra cost to you.
        </p>
      </section>

      <footer>
        Veylola Finds © 2026
      </footer>

      <style jsx>{`*{box-sizing:border-box}body{margin:0}main{min-height:100vh;color:#172033;font-family:Inter,ui-sans-serif,system-ui,sans-serif;background:linear-gradient(135deg,#eef4ff,#faf2ff 45%,#eafff8);position:relative;overflow:hidden}main:before,main:after{content:"";position:fixed;border-radius:50%;filter:blur(65px);opacity:.4;pointer-events:none;z-index:0}main:before{width:340px;height:340px;background:#8db9ff;top:40px;left:-130px}main:after{width:380px;height:380px;background:#e39cff;right:-140px;top:230px}.nav{height:72px;padding:0 7%;display:flex;align-items:center;justify-content:space-between;position:sticky;top:12px;margin:12px 18px 0;border-radius:22px;z-index:20;background:rgba(255,255,255,.52);border:1px solid rgba(255,255,255,.82);box-shadow:0 20px 60px rgba(75,65,120,.12),inset 0 1px 0 #fff;backdrop-filter:blur(25px);-webkit-backdrop-filter:blur(25px)}.brand{display:flex;align-items:center;gap:10px;font-weight:850;font-size:19px}.brandMark{width:36px;height:36px;display:grid;place-items:center;border-radius:13px;background:linear-gradient(135deg,#6258ff,#c04fff,#20caa8);color:#fff;font-weight:950;box-shadow:0 8px 20px rgba(100,80,230,.25)}.navCta,.primary{background:linear-gradient(135deg,#6258ff,#b653ff);color:white;text-decoration:none;border-radius:14px;font-weight:850;box-shadow:0 10px 24px rgba(100,82,230,.2)}.navCta{padding:10px 17px;font-size:14px}.hero{min-height:570px;padding:80px 8%;display:grid;grid-template-columns:1.4fr .6fr;gap:70px;align-items:center;position:relative;z-index:1}.eyebrow,.sectionEyebrow{font-size:12px;font-weight:900;letter-spacing:2px;color:#68708a}.eyebrow{margin:0 0 8px}h1{font-size:clamp(48px,7vw,86px);line-height:.98;letter-spacing:-5px;margin:20px 0}h1 span{background:linear-gradient(90deg,#665cff,#c54fff,#16c7a1);-webkit-background-clip:text;background-clip:text;color:transparent}.heroCopy>p{max-width:550px;color:#697287;font-size:18px;line-height:1.6}.heroActions{margin-top:30px}.primary{display:inline-block;padding:15px 21px}.heroCard,.product,.empty,.disclosure{background:rgba(255,255,255,.5);border:1px solid rgba(255,255,255,.8);box-shadow:0 20px 60px rgba(75,65,120,.1),inset 0 1px 0 #fff;backdrop-filter:blur(22px);-webkit-backdrop-filter:blur(22px)}.heroCard{min-height:330px;padding:30px;border-radius:30px;display:flex;flex-direction:column;justify-content:center;gap:13px}.dealBadge,.tag{width:fit-content;border-radius:999px;background:rgba(255,255,255,.7);border:1px solid rgba(255,255,255,.8);font-weight:850}.dealBadge{padding:7px 10px;font-size:10px;letter-spacing:1px}.heroIcon{font-size:70px}.heroCard strong{font-size:22px}.heroCard span:last-child{color:#697287;line-height:1.5}.deals{max-width:1400px;margin:auto;padding:90px 7%;position:relative;z-index:1}.sectionHead{display:flex;align-items:end;justify-content:space-between;gap:20px;margin-bottom:35px}.sectionEyebrow{margin:0 0 8px}.sectionHead h2{font-size:42px;letter-spacing:-2px;margin:0}.smallNote{color:#737b90;font-size:13px}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(245px,1fr));gap:25px}.product{border-radius:24px;overflow:hidden;transition:transform .2s ease,box-shadow .2s ease}.product:hover{transform:translateY(-6px);box-shadow:0 28px 70px rgba(75,65,120,.17)}.imageWrap{height:270px;position:relative;background:rgba(235,237,255,.55);overflow:hidden}.imageWrap img{width:100%;height:100%;object-fit:cover}.tag{position:absolute;top:13px;left:13px;padding:7px 10px;font-size:11px}.productBody{padding:19px}.productBody h3{margin:0 0 9px;font-size:19px}.productBody p{min-height:45px;color:#737b90;line-height:1.5;font-size:14px}.productFoot{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:20px}.productFoot strong{font-size:19px}.productFoot a{background:linear-gradient(135deg,#6258ff,#b653ff);color:#fff;text-decoration:none;padding:10px 13px;border-radius:12px;font-size:12px;font-weight:850}.empty{padding:40px;border-radius:22px;text-align:center;color:#737b90}.error{color:#ad1f4a;background:rgba(255,230,238,.65)}.disclosure{padding:35px 7%;border-radius:0}.disclosure p{max-width:800px;color:#697287;line-height:1.6}footer{padding:40px;text-align:center;background:rgba(25,25,40,.9);color:#fff;position:relative;z-index:1}@media(max-width:800px){.hero{grid-template-columns:1fr;gap:35px;padding:65px 25px}h1{font-size:50px;letter-spacing:-3px}.heroCard{min-height:260px}.deals{padding:65px 20px}.sectionHead{display:block}.smallNote{display:block;margin-top:12px}.nav{padding:0 20px}}`}</style>
    </main>
  );
}