create table if not exists public.products (
 id uuid primary key default gen_random_uuid(),
 name text not null,
 category text not null default 'Tech',
 price text not null,
 image text not null,
 description text not null default '',
 affiliate_url text not null,
 published boolean not null default true,
 created_at timestamptz not null default now()
);
alter table public.products enable row level security;
create policy "Public can read published products" on public.products for select using (published = true);
create policy "Authenticated admins can read products" on public.products for select to authenticated using (true);
create policy "Authenticated admins can insert products" on public.products for insert to authenticated with check (true);
create policy "Authenticated admins can update products" on public.products for update to authenticated using (true) with check (true);
create policy "Authenticated admins can delete products" on public.products for delete to authenticated using (true);