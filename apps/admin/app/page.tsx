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
  published: boolean;
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        if (!SUPABASE_URL || !SUPABASE_KEY) {
          setError(
            "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Render."
          );
          setLoading(false);
          return;
        }

        const supabase = createClient(
          SUPABASE_URL,
          SUPABASE_KEY
        );

        const { data, error: databaseError } = await supabase
          .from("products")
          .select("*")
          .eq("published", true)
          .order("created_at", { ascending: false });

        if (databaseError) {
          setError(databaseError.message);
          setProducts([]);
        } else {
          setProducts((data || []) as Product[]);
        }
      } catch (err) {
        console.error(err);
        setError("Unable to load products.");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  return (
    <main className="store">
      <header className="header">
        <div className="logo">Veylola</div>

        <nav>
          <a href="/">Home</a>
          <a href="#products">Products</a>
        </nav>
      </header>

      <section className="hero">
        <div>
          <p className="tag">WELCOME TO VEYLOLA</p>

          <h1>
            Shop the products
            <br />
            you love.
          </h1>

          <p className="heroText">
            Discover carefully selected products from Veylola.
          </p>

          <a href="#products" className="shopButton">
            Shop Now
          </a>
        </div>
      </section>

      <section id="products" className="productsSection">
        <div className="sectionHeader">
          <h2>Latest Products</h2>
          <p>Explore our newest products.</p>
        </div>

        {loading && (
          <div className="message">
            Loading products...
          </div>
        )}

        {!loading && error && (
          <div className="message error">
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          products.length === 0 && (
            <div className="message">
              No products available yet.
            </div>
          )}

        {!loading && !error && products.length > 0 && (
          <div className="productGrid">
            {products.map((product) => (
              <article
                className="productCard"
                key={product.id}
              >
                <div className="imageContainer">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="productImage"
                    />
                  ) : (
                    <div className="noImage">
                      No Image
                    </div>
                  )}
                </div>

                <div className="productInfo">
                  <span className="category">
                    {product.category}
                  </span>

                  <h3>{product.name}</h3>

                  <p className="description">
                    {product.description}
                  </p>

                  <div className="bottom">
                    <strong>{product.price}</strong>

                    {product.affiliate_url && (
                      <a
                        href={product.affiliate_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="buyButton"
                      >
                        Buy Now
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer className="footer">
        <p>© {new Date().getFullYear()} Veylola. All rights reserved.</p>
      </footer>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .store {
          min-height: 100vh;
          background: #f7f7f8;
          color: #111;
          font-family:
            Arial,
            Helvetica,
            sans-serif;
        }

        .header {
          height: 72px;
          padding: 0 6%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #fff;
          border-bottom: 1px solid #eee;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .logo {
          font-size: 25px;
          font-weight: 800;
          letter-spacing: -1px;
        }

        nav {
          display: flex;
          gap: 25px;
        }

        nav a {
          color: #111;
          text-decoration: none;
          font-weight: 600;
        }

        .hero {
          min-height: 480px;
          padding: 80px 8%;
          display: flex;
          align-items: center;
          background: linear-gradient(
            135deg,
            #ffffff,
            #eeeeee
          );
        }

        .tag {
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 2px;
          margin-bottom: 15px;
        }

        .hero h1 {
          font-size: clamp(42px, 7vw, 78px);
          line-height: 0.98;
          letter-spacing: -4px;
          margin: 0;
          max-width: 800px;
        }

        .heroText {
          font-size: 18px;
          color: #666;
          max-width: 500px;
          margin: 25px 0;
          line-height: 1.6;
        }

        .shopButton,
        .buyButton {
          display: inline-block;
          text-decoration: none;
          color: #fff;
          background: #111;
          border-radius: 10px;
          font-weight: 700;
          transition: transform 0.2s;
        }

        .shopButton {
          padding: 14px 24px;
        }

        .shopButton:hover,
        .buyButton:hover {
          transform: translateY(-2px);
        }

        .productsSection {
          padding: 70px 6%;
          max-width: 1400px;
          margin: auto;
        }

        .sectionHeader {
          margin-bottom: 35px;
        }

        .sectionHeader h2 {
          font-size: 35px;
          margin: 0 0 8px;
        }

        .sectionHeader p {
          color: #777;
        }

        .productGrid {
          display: grid;
          grid-template-columns:
            repeat(auto-fill, minmax(240px, 1fr));
          gap: 25px;
        }

        .productCard {
          background: #fff;
          border-radius: 18px;
          overflow: hidden;
          border: 1px solid #e9e9e9;
          transition:
            transform 0.2s,
            box-shadow 0.2s;
        }

        .productCard:hover {
          transform: translateY(-4px);
          box-shadow:
            0 12px 35px rgba(0, 0, 0, 0.08);
        }

        .imageContainer {
          width: 100%;
          height: 260px;
          background: #eee;
        }

        .productImage {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .noImage {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #888;
        }

        .productInfo {
          padding: 18px;
        }

        .category {
          color: #777;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .productInfo h3 {
          font-size: 20px;
          margin: 8px 0;
        }

        .description {
          color: #666;
          font-size: 14px;
          line-height: 1.5;
          min-height: 42px;
        }

        .bottom {
          margin-top: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .bottom strong {
          font-size: 19px;
        }

        .buyButton {
          padding: 10px 14px;
          font-size: 13px;
        }

        .message {
          padding: 35px;
          background: #fff;
          border-radius: 15px;
          text-align: center;
          color: #666;
        }

        .error {
          color: #b00020;
        }

        .footer {
          padding: 40px 20px;
          text-align: center;
          background: #111;
          color: #aaa;
          margin-top: 50px;
        }

        @media (max-width: 600px) {
          .header {
            padding: 0 20px;
          }

          nav {
            gap: 12px;
          }

          nav a {
            font-size: 13px;
          }

          .hero {
            padding: 60px 25px;
          }

          .hero h1 {
            letter-spacing: -2px;
          }

          .productsSection {
            padding: 50px 20px;
          }

          .productGrid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}