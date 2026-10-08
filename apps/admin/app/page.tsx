
"use client";

import { useEffect, useState } from "react";
import { createClient, User } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const getSupabase = () => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      "Supabase environment variables are missing. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Render."
    );
  }

  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
};

type P = {
  id?: string;
  name: string;
  category: string;
  price: string;
  image: string;
  description: string;
  affiliate_url: string;
  published: boolean;
};

const blank: P = {
  name: "",
  category: "Tech",
  price: "",
  image: "",
  description: "",
  affiliate_url: "",
  published: true,
};

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [p, setP] = useState<P>(blank);
  const [items, setItems] = useState<P[]>([]);
  const [msg, setMsg] = useState("");

  const load = async () => {
    try {
      const supabase = getSupabase();

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        setMsg(error.message);
        return;
      }

      setItems((data || []) as P[]);
    } catch (error) {
      setMsg(error instanceof Error ? error.message : "Supabase error.");
    }
  };

  useEffect(() => {
    try {
      const supabase = getSupabase();

      supabase.auth.getUser().then((r) => {
        setUser(r.data.user);
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null);
      });

      return () => subscription.unsubscribe();
    } catch (error) {
      setMsg(error instanceof Error ? error.message : "Supabase configuration missing.");
    }
  }, []);

  useEffect(() => {
    if (user) {
      load();
    }
  }, [user]);

  async function login() {
    try {
      const supabase = getSupabase();

      const r = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      setMsg(r.error?.message || "Signed in.");
    } catch (error) {
      setMsg(error instanceof Error ? error.message : "Login failed.");
    }
  }

  async function save() {
    if (!p.name || !p.affiliate_url) {
      setMsg("Product name and affiliate link are required.");
      return;
    }

    try {
      const supabase = getSupabase();

      const { error } = await supabase.from("products").upsert(p);

      setMsg(error?.message || "Product published.");

      if (!error) {
        setP(blank);
        await load();
      }
    } catch (error) {
      setMsg(error instanceof Error ? error.message : "Could not save product.");
    }
  }

  async function del(id?: string) {
    if (!id || !confirm("Delete this product?")) return;

    try {
      const supabase = getSupabase();

      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (error) {
        setMsg(error.message);
        return;
      }

      await load();
    } catch (error) {
      setMsg(error instanceof Error ? error.message : "Could not delete product.");
    }
  }

  if (!user) {
    return (
      <main className="login">
        <div className="panel">
          <div className="logo">V</div>

          <h1>Veylola Admin</h1>

          <p>
            Sign in to publish products to the customer store.
          </p>

          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button onClick={login}>Sign in</button>

          <small>{msg}</small>
        </div>
      </main>
    );
  }

  return (
    <main>
      <nav>
        <b>Veylola Admin</b>

        <button
          className="ghost"
          onClick={async () => {
            try {
              await getSupabase().auth.signOut();
            } catch (error) {
              setMsg(
                error instanceof Error
                  ? error.message
                  : "Could not sign out."
              );
            }
          }}
        >
          Sign out
        </button>
      </nav>

      <section className="dashboard">
        <div className="panel">
          <h2>{p.id ? "Edit product" : "Publish a product"}</h2>

          <input
            placeholder="Product name"
            value={p.name}
            onChange={(e) =>
              setP({ ...p, name: e.target.value })
            }
          />

          <input
            placeholder="Category"
            value={p.category}
            onChange={(e) =>
              setP({ ...p, category: e.target.value })
            }
          />

          <input
            placeholder="Price e.g. $19.99"
            value={p.price}
            onChange={(e) =>
              setP({ ...p, price: e.target.value })
            }
          />

          <input
            placeholder="Image URL"
            value={p.image}
            onChange={(e) =>
              setP({ ...p, image: e.target.value })
            }
          />

          <input
            placeholder="AliExpress affiliate URL"
            value={p.affiliate_url}
            onChange={(e) =>
              setP({
                ...p,
                affiliate_url: e.target.value,
              })
            }
          />

          <textarea
            placeholder="Short description"
            value={p.description}
            onChange={(e) =>
              setP({
                ...p,
                description: e.target.value,
              })
            }
          />

          <label>
            <input
              type="checkbox"
              checked={p.published}
              onChange={(e) =>
                setP({
                  ...p,
                  published: e.target.checked,
                })
              }
            />{" "}
            Publish on customer site
          </label>

          <button onClick={save}>
            {p.id ? "Update product" : "Publish product"}
          </button>

          <small>{msg}</small>
        </div>

        <div>
          <h2>Products</h2>

          <div className="list">
            {items.map((x) => (
              <article key={x.id}>
                <div>
                  <b>{x.name}</b>

                  <span>
                    {x.price} ·{" "}
                    {x.published ? "Published" : "Hidden"}
                  </span>
                </div>

                <div>
                  <button
                    className="ghost"
                    onClick={() => setP(x)}
                  >
                    Edit
                  </button>

                  <button
                    className="danger"
                    onClick={() => del(x.id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}