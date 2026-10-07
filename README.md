# Veylola Shop

Veylola Shop is a mobile-first dropshipping storefront foundation.

## Current MVP
- Responsive product catalog
- Product search
- Working client-side cart with quantities and totals
- Supabase-ready authentication/data layer
- Order schema for customer orders and order items
- Admin/product-management architecture
- Supplier price and markup fields for profit tracking

## Run
```bash
npm install
npm run dev
```

## Supabase
Copy `.env.example` to `.env.local` and add the public Supabase URL and anon/publishable key.

Never put a Supabase service-role key or payment secret in browser code.

## Next production integrations
1. Supabase email/password authentication
2. Server-side checkout/order creation
3. Nigerian payment gateway (for example Paystack or Flutterwave)
4. Admin authentication and product CRUD
5. Supplier/AliExpress product import workflow
6. Shipping and order tracking