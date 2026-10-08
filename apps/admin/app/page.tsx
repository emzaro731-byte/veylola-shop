
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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!supabaseUrl || !supabaseAnonKey) {
      setError("Store configuration is missing.");
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    supabase
      .from("products")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          setError(error.message);
          return;
        }

        setProducts((data || []) as Product[]);
      });
  }, []);

  return (
    <main>
      <h1>Veylola Store</h1>

      {error && <p>{error}</p>}

      {products.map((product) => (
        <article key={product.id}>
          {product.image && (
            <img
              src={product.image}
              alt={product.name}
              width={300}
            />
          )}

          <h2>{product.name}</h2>
          <p>{product.description}</p>
          <p>{product.price}</p>

          <a
            href={product.affiliate_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Buy Now
          </a>
        </article>
      ))}
    </main>
  );
}