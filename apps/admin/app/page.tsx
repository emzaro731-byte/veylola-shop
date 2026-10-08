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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProducts() {
      if (!supabase) {
        setError("Store configuration is missing.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setProducts((data || []) as Product[]);
      }

      setLoading(false);
    }

    loadProducts();
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <header
        style={{
          maxWidth: "1200px",
          margin: "0 auto 40px",
          textAlign: "center",
        }}
      >
        <h1>Veylola Store</h1>
        <p>Discover amazing products at great prices.</p>
      </header>

      {loading && (
        <p style={{ textAlign: "center" }}>
          Loading products...
        </p>
      )}

      {error && (
        <p
          style={{
            textAlign: "center",
            color: "red",
            marginBottom: "20px",
          }}
        >
          {error}
        </p>
      )}

      {!loading && !error && products.length === 0 && (
        <p style={{ textAlign: "center" }}>
          No products available yet.
        </p>
      )}

      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "24px",
        }}
      >
        {products.map((product) => (
          <article
            key={product.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "16px",
              padding: "16px",
              background: "#fff",
              boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
            }}
          >
            {product.image && (
              <img
                src={product.image}
                alt={product.name}
                style={{
                  width: "100%",
                  height: "220px",
                  objectFit: "cover",
                  borderRadius: "12px",
                  marginBottom: "15px",
                }}
              />
            )}

            <p
              style={{
                fontSize: "13px",
                color: "#777",
              }}
            >
              {product.category}
            </p>

            <h2>{product.name}</h2>

            <p>{product.description}</p>

            <strong
              style={{
                display: "block",
                fontSize: "20px",
                margin: "15px 0",
              }}
            >
              {product.price}
            </strong>

            {product.affiliate_url && (
              <a
                href={product.affiliate_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "12px 18px",
                  borderRadius: "10px",
                  background: "#000",
                  color: "#fff",
                  textDecoration: "none",
                  fontWeight: "bold",
                }}
              >
                Buy Now
              </a>
            )}
          </article>
        ))}
      </section>
    </main>
  );
}