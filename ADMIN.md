# Veylola Admin

The admin area should manage products, supplier links, prices, stock and orders.

## Recommended admin flow
1. Authenticate the administrator with Supabase Auth.
2. Keep an allowlist of admin user IDs in a server-side environment variable or dedicated admin table.
3. Never expose a service-role key in browser code.
4. Product changes should happen through protected server actions/API routes.
5. Supplier URLs are internal metadata and should not be trusted as payment endpoints.

## Profit
profit per unit = retail price - supplier price - shipping - payment fees - advertising cost
