-- Veylola Shop Supabase schema
create extension if not exists "pgcrypto";

create table if not exists products (
 id uuid primary key default gen_random_uuid(),
 name text not null,
 description text,
 category text,
 image_url text,
 price numeric(12,2) not null default 0,
 supplier_price numeric(12,2) not null default 0,
 supplier_url text,
 stock integer not null default 0,
 active boolean not null default true,
 created_at timestamptz not null default now(),
 supplier_product_id text,
 supplier_name text default 'AliExpress',
 supplier_variant_id text,
 supplier_currency text default 'USD',
 supplier_image_url text,
 shipping_cost numeric(12,2) not null default 0,
 tracking_number text,
 supplier_order_id text,
 supplier_status text
);

create table if not exists orders (
 id uuid primary key default gen_random_uuid(),
 user_id uuid references auth.users(id) on delete set null,
 status text not null default 'pending',
 customer_name text not null,
 customer_email text not null,
 shipping_address text not null,
 total numeric(12,2) not null default 0,
 created_at timestamptz not null default now()
);

create table if not exists order_items (
 id uuid primary key default gen_random_uuid(),
 order_id uuid not null references orders(id) on delete cascade,
 product_id uuid references products(id) on delete set null,
 product_name text not null,
 quantity integer not null check (quantity > 0),
 unit_price numeric(12,2) not null,
 supplier_price numeric(12,2) not null
);

alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

create policy "public can view active products" on products for select using (active = true);
create policy "users can view own orders" on orders for select using (auth.uid() = user_id);
create policy "users can view own order items" on order_items for select using (
 exists (select 1 from orders o where o.id = order_id and o.user_id = auth.uid())
);


alter table orders add column if not exists payment_reference text unique;
alter table orders add column if not exists payment_status text not null default 'unpaid';
alter table orders add column if not exists paid_at timestamptz;

-- AliExpress / supplier metadata for imported products and fulfillment.
alter table products add column if not exists supplier_product_id text;
alter table products add column if not exists supplier_name text default 'AliExpress';
alter table products add column if not exists supplier_variant_id text;
alter table products add column if not exists supplier_currency text default 'USD';
alter table products add column if not exists supplier_image_url text;
alter table products add column if not exists shipping_cost numeric(12,2) not null default 0;
alter table products add column if not exists tracking_number text;
alter table products add column if not exists supplier_order_id text;
alter table products add column if not exists supplier_status text;

create unique index if not exists products_supplier_product_id_idx on products(supplier_product_id);

-- Demo catalog seed. Replace supplier URLs/images with your approved supplier listings before launch.
insert into products (id,name,category,price,supplier_price,image_url,stock,active)
values
('11111111-1111-4111-8111-111111111111','Magnetic Phone Holder','Phone Accessories',12900,6500,'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=800&q=80',100,true),
('22222222-2222-4222-8222-222222222222','Mini Portable Blender','Home & Kitchen',21900,11800,'https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=800&q=80',100,true),
('33333333-3333-4333-8333-333333333333','Smart LED Desk Lamp','Home & Office',18500,9200,'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',100,true),
('44444444-4444-4444-8444-444444444444','Wireless Earbuds Case','Electronics',9900,4200,'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=800&q=80',100,true)
on conflict (id) do nothing;
