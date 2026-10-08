create table if not exists public.products (
 id uuid primary key default gen_random_uuid(),
 name text not null,
 category text not null default 'Electronics',
 price text not null,
 image text not null,
 description text not null default '',
 affiliate_url text not null,
 published boolean not null default true,
 created_at timestamptz not null default now()
);
alter table public.products enable row level security;
do $$ begin
 if not exists (select 1 from pg_policies where schemaname='public' and tablename='products' and policyname='Public can read published products') then create policy "Public can read published products" on public.products for select using (published = true); end if;
 if not exists (select 1 from pg_policies where schemaname='public' and tablename='products' and policyname='Authenticated admins can read products') then create policy "Authenticated admins can read products" on public.products for select to authenticated using (true); end if;
 if not exists (select 1 from pg_policies where schemaname='public' and tablename='products' and policyname='Authenticated admins can insert products') then create policy "Authenticated admins can insert products" on public.products for insert to authenticated with check (true); end if;
 if not exists (select 1 from pg_policies where schemaname='public' and tablename='products' and policyname='Authenticated admins can update products') then create policy "Authenticated admins can update products" on public.products for update to authenticated using (true) with check (true); end if;
 if not exists (select 1 from pg_policies where schemaname='public' and tablename='products' and policyname='Authenticated admins can delete products') then create policy "Authenticated admins can delete products" on public.products for delete to authenticated using (true); end if;
end $$;

create table if not exists public.categories (
 id uuid primary key default gen_random_uuid(),
 name text not null unique,
 image_url text not null default '',
 description text not null default '',
 featured boolean not null default false,
 active boolean not null default true,
 sort_order integer not null default 0,
 created_at timestamptz not null default now()
);
alter table public.categories enable row level security;
do $$ begin
 if not exists (select 1 from pg_policies where schemaname='public' and tablename='categories' and policyname='Public can read active categories') then create policy "Public can read active categories" on public.categories for select using (active = true); end if;
 if not exists (select 1 from pg_policies where schemaname='public' and tablename='categories' and policyname='Authenticated admins can manage categories') then create policy "Authenticated admins can manage categories" on public.categories for all to authenticated using (true) with check (true); end if;
end $$;

insert into public.categories (name,featured,active,sort_order) values
('Electronics',true,true,0),('Phones & Accessories',true,true,1),('Computers & Accessories',true,true,2),('Fashion',true,true,3),('Beauty & Personal Care',true,true,4),('Home & Garden',true,true,5),('Home Appliances',false,true,6),('Kitchen',false,true,7),('Health & Fitness',false,true,8),('Sports & Outdoors',false,true,9),('Baby & Kids',false,true,10),('Shoes & Bags',false,true,11),('Jewelry & Accessories',false,true,12),('Automotive',false,true,13),('Office & School',false,true,14),('Gaming',false,true,15),('Groceries',false,true,16),('Other',false,true,17)
on conflict (name) do nothing;