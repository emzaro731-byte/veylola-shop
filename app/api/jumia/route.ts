import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").map(x => x.trim().toLowerCase()).filter(Boolean);

async function getAdmin(request: Request) {
  const auth = request.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return null;
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: "Bearer " + token } } }
  );
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user || !ADMIN_EMAILS.includes((user.email || "").toLowerCase())) return null;
  return user;
}

function meta(html: string, property: string) {
  const safe = property.replace(/[.*+?^$()|[\]\\]/g, "\\$&");
  const re = new RegExp('<meta[^>]+(?:property|name)=["\\']' + safe + '["\\'][^>]+content=["\\']([^"\\']+)["\\']', "i");
  const m = html.match(re);
  return m?.[1]?.replace(/&amp;/g, "&").replace(/&quot;/g, '"') || "";
}

function title(html: string) {
  return meta(html, "og:title") || html.match(/<title[^>]*>([\\s\\S]*?)<\\/title>/i)?.[1]?.trim() || "";
}

export async function POST(request: Request) {
  if (!await getAdmin(request)) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  try {
    const { url } = await request.json();
    let parsed: URL;
    try { parsed = new URL(url); } catch {
      return NextResponse.json({ error: "Enter a valid Jumia product URL." }, { status: 400 });
    }
    if (parsed.hostname.toLowerCase() !== "jumia.com.ng" && !parsed.hostname.toLowerCase().endsWith(".jumia.com.ng")) {
      return NextResponse.json({ error: "Only Jumia Nigeria product URLs are supported." }, { status: 400 });
    }
    const response = await fetch(parsed.toString(), { headers: { "User-Agent": "Mozilla/5.0" }, redirect: "follow" });
    if (!response.ok) return NextResponse.json({ error: "Could not open the Jumia product page." }, { status: 502 });
    const html = await response.text();
    return NextResponse.json({ product: { name: title(html), image: meta(html, "og:image"), url: response.url } });
  } catch {
    return NextResponse.json({ error: "Could not read the Jumia product page." }, { status: 502 });
  }
}

export async function PUT(request: Request) {
  if (!await getAdmin(request)) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  if (!process.env.SUPABASE_SECRET_KEY) return NextResponse.json({ error: "SUPABASE_SECRET_KEY is missing on the server." }, { status: 503 });
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const url = String(body.url || "").trim();
    const supplierPrice = Number(body.supplierPrice);
    const markup = Number(body.markupPercent ?? 40);
    const image = String(body.image || "").trim();
    if (!name || !url || !supplierPrice || supplierPrice < 0 || markup < 0) {
      return NextResponse.json({ error: "Product name, Jumia URL, supplier price and markup are required." }, { status: 400 });
    }
    const retailPrice = Math.ceil(supplierPrice * (1 + markup / 100) / 100) * 100;
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!);
    const { data, error } = await supabase.from("products").insert({
      name: name.slice(0, 180), description: "Sourced from Jumia.", category: "Jumia",
      image_url: image || null, supplier_image_url: image || null, price: retailPrice,
      supplier_price: supplierPrice, supplier_url: url, supplier_name: "Jumia",
      supplier_currency: "NGN", stock: 999, active: true
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ product: data, retailPrice, profit: retailPrice - supplierPrice });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Import failed." }, { status: 500 });
  }
}