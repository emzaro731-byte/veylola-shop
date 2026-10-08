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

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        main {
          min-height: 100vh;
          background: #f7f7f5;
          color: #111;
          font-family:
            Arial,
            Helvetica,
            sans-serif;
        }

        .nav {
          height: 72px;
          padding: 0 7%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: white;
          border-bottom: 1px solid #e8e8e8;
          position: sticky;
          top: 0;
          z-index: 20;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 800;
          font-size: 19px;
        }

        .brandMark {
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: #111;
          color: white;
          font-weight: 900;
        }

        .navCta {
          background: #111;
          color: white;
          text-decoration: none;
          padding: 10px 17px;
          border-radius: 9px;
          font-size: 14px;
          font-weight: 700;
        }

        .hero {
          min-height: 570px;
          padding: 80px 8%;
          display: grid;
          grid-template-columns: 1.4fr 0.6fr;
          gap: 70px;
          align-items: center;
          background:
            radial-gradient(
              circle at 80% 30%,
              #e6e6e6,
              transparent 35%
            ),
            #f7f7f5;
        }

        .eyebrow,
        .sectionEyebrow {
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 2px;
        }

        .eyebrow {
          color: #777;
        }

        h1 {
          font-size: clamp(48px, 7vw, 86px);
          line-height: 0.98;
          letter-spacing: -5px;
          margin: 20px 0;
        }

        h1 span {
          color: #777;
        }

        .heroCopy > p {
          max-width: 550px;
          color: #666;
          font-size: 18px;
          line-height: 1.6;
        }

        .heroActions {
          margin-top: 30px;
        }

        .primary {
          display: inline-block;
          padding: 15px 21px;
          background: #111;
          color: white;
          text-decoration: none;
          border-radius: 10px;
          font-weight: 700;
        }

        .heroCard {
          min-height: 330px;
          padding: 30px;
          border-radius: 28px;
          background: white;
          border: 1px solid #e5e5e5;
          box-shadow: 0 25px 70px rgba(0, 0, 0, 0.08);
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 13px;
        }

        .dealBadge {
          width: fit-content;
          padding: 7px 10px;
          border-radius: 20px;
          background: #111;
          color: white;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .heroIcon {
          font-size: 70px;
          margin: 10px 0;
        }

        .heroCard strong {
          font-size: 22px;
        }

        .heroCard span:last-child {
          color: #777;
          line-height: 1.5;
        }

        .deals {
          max-width: 1400px;
          margin: auto;
          padding: 90px 7%;
        }

        .sectionHead {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 35px;
        }

        .sectionEyebrow {
          color: #888;
          margin: 0 0 8px;
        }

        .sectionHead h2 {
          font-size: 42px;
          letter-spacing: -2px;
          margin: 0;
        }

        .smallNote {
          color: #888;
          font-size: 13px;
        }

        .grid {
          display: grid;
          grid-template-columns:
            repeat(auto-fill, minmax(245px, 1fr));
          gap: 25px;
        }

        .product {
          background: white;
          border: 1px solid #e7e7e7;
          border-radius: 20px;
          overflow: hidden;
          transition: transform 0.2s ease;
        }

        .product:hover {
          transform: translateY(-5px);
        }

        .imageWrap {
          height: 270px;
          position: relative;
          background: #eee;
        }

        .imageWrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .tag {
          position: absolute;
          top: 13px;
          left: 13px;
          padding: 7px 10px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.92);
          font-size: 11px;
          font-weight: 700;
        }

        .productBody {
          padding: 19px;
        }

        .productBody h3 {
          margin: 0 0 9px;
          font-size: 19px;
        }

        .productBody p {
          min-height: 45px;
          color: #777;
          line-height: 1.5;
          font-size: 14px;
        }

        .productFoot {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: 20px;
        }

        .productFoot strong {
          font-size: 19px;
        }

        .productFoot a {
          background: #111;
          color: white;
          text-decoration: none;
          padding: 10px 13px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
        }

        .empty {
          padding: 40px;
          background: white;
          border: 1px solid #e5e5e5;
          border-radius: 15px;
          text-align: center;
          color: #777;
        }

        .error {
          color: #b00020;
          margin-bottom: 25px;
        }

        .disclosure {
          padding: 35px 7%;
          background: #ededeb;
        }

        .disclosure p {
          max-width: 800px;
          color: #666;
          line-height: 1.6;
        }

        footer {
          padding: 40px;
          text-align: center;
          background: #111;
          color: white;
        }

        @media (max-width: 800px) {
          .hero {
            grid-template-columns: 1fr;
            gap: 35px;
            padding: 65px 25px;
          }

          h1 {
            font-size: 50px;
            letter-spacing: -3px;
          }

          .heroCard {
            min-height: 260px;
          }

          .deals {
            padding: 65px 20px;
          }

          .sectionHead {
            display: block;
          }

          .smallNote {
            display: block;
            margin-top: 12px;
          }

          .nav {
            padding: 0 20px;
          }
        }
      `}</style>
    </main>
  );
}