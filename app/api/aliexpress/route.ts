import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const APP_KEY = process.env.ALIEXPRESS_APP_KEY;
const APP_SECRET = process.env.ALIEXPRESS_APP_SECRET;
const TRACKING_ID = process.env.ALIEXPRESS_TRACKING_ID || "veyloLa";
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").map(x=>x.trim().toLowerCase()).filter(Boolean);
const API_URL = "https://eco.taobao.com/router/rest";

function sign(params: Record<string,string>) {
  const raw = Object.keys(params).sort().map(k => k + params[k]).join("");
  return crypto.createHmac("md5", APP_SECRET!).update(raw).digest("hex").toUpperCase();
}

async function getAdmin(request: Request) {
  const auth = request.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return null;
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    global: { headers: { Authorization: "Bearer " + token } }
  });
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user || !ADMIN_EMAILS.includes((user.email || "").toLowerCase())) return null;
  return user;
}

export async function POST(request: Request) {
  if (!APP_KEY || !APP_SECRET) return NextResponse.json({ error: "AliExpress API is not configured. Add ALIEXPRESS_APP_KEY and ALIEXPRESS_APP_SECRET in Render." }, { status: 503 });
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  if (!await getAdmin(request)) return NextResponse.json({ error: "Admin access required." }, { status: 403 });

  try {
    const body = await request.json();
    const action = body.action || "search";
    const params: Record<string,string> = {
      app_key: APP_KEY,
      format: "json",
      method: "aliexpress.affiliate.product.query",
      sign_method: "hmac",
      timestamp: new Date().toLocaleString("sv-SE", { timeZone: "Asia/Shanghai" }).replace("T", " "),
      v: "2.0",
      fields: "commission_rate,sale_price,original_price,evaluate_rate,product_title,product_main_image_url,product_id,product_detail_url,product_small_image_urls,lastest_volume",
      keywords: String(body.keyword || "").trim(),
      page_no: String(body.page || 1),
      page_size: String(Math.min(Number(body.pageSize || 20), 50)),
      sort: "SALE_PRICE_ASC",
      tracking_id: TRACKING_ID,
      target_currency: "USD",
      target_language: "EN",
      ship_to_country: "NG"
    };
    if (!params.keywords) return NextResponse.json({ error: "Enter a product keyword." }, { status: 400 });
    params.sign = sign(params);

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=utf-8" },
      body: new URLSearchParams(params)
    });
    const data = await response.json();
    if (!response.ok || data?.error_response) return NextResponse.json({ error: data?.error_response?.msg || "AliExpress API request failed.", details: data?.error_response || data }, { status: 502 });

    const result = data?.aliexpress_affiliate_product_query_response?.resp_result?.result || data?.resp_result?.result || {};
    const products = result?.products?.product || result?.products?.product_list || [];
    return NextResponse.json({ products: Array.isArray(products) ? products : [products].filter(Boolean) });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "AliExpress request failed." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!APP_KEY || !APP_SECRET) return NextResponse.json({ error: "AliExpress API is not configured." }, { status: 503 });
  const admin = await getAdmin(request);
  if (!admin) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  try {
    const body = await request.json();
    const p = body.product || {};
    const supplierPriceUsd = Number(p.sale_price || p.app_sale_price || 0);
    const usdToNgn = Number(body.usdToNgn || process.env.ALIEXPRESS_USD_TO_NGN || 0);
    const markup = Number(body.markupPercent ?? 40);
    if (!p.product_id || !p.product_title || !supplierPriceUsd || !usdToNgn) {
      return NextResponse.json({ error: "Product, USD→NGN rate, and supplier price are required." }, { status: 400 });
    }
    const supplierPriceNgn = supplierPriceUsd * usdToNgn;
    const retailPrice = Math.ceil(supplierPriceNgn * (1 + markup / 100) / 100) * 100;
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!);
    if (!process.env.SUPABASE_SECRET_KEY) return NextResponse.json({ error: "SUPABASE_SECRET_KEY is missing on the server." }, { status: 503 });

    const image = p.product_main_image_url || p.product_main_image || "";
    const { data, error } = await supabase.from("products").upsert({
      name: String(p.product_title).slice(0, 180),
      description: "Imported from AliExpress.",
      category: "AliExpress",
      image_url: image,
      supplier_image_url: image,
      price: retailPrice,
      supplier_price: supplierPriceNgn,
      supplier_url: p.product_detail_url || null,
      supplier_product_id: String(p.product_id),
      supplier_name: "AliExpress",
      supplier_currency: "USD",
      stock: 999,
      active: true
    }, { onConflict: "supplier_product_id" }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ product: data, supplierPriceNgn, retailPrice });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Import failed." }, { status: 500 });
  }
}