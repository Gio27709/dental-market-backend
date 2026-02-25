-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Drop existing objects (Clean slate for idempotent runs)
drop table if exists public.order_items cascade;
drop table if exists public.orders cascade;
drop table if exists public.product_variations cascade;
drop table if exists public.products cascade;
drop table if exists public.stores cascade;
drop table if exists public.profiles cascade;
drop table if exists public.exchange_rates cascade;
drop table if exists public.cart_items cascade;
drop table if exists public.categories cascade;
drop table if exists public.brands cascade;
drop table if exists public.store_settings cascade;

drop type if exists public.user_role cascade;
drop type if exists public.profile_status cascade;
drop type if exists public.order_status cascade;

-- 2. Create ENUMs
create type public.user_role as enum ('owner', 'admin', 'dental', 'buyer', 'dentist');
create type public.profile_status as enum ('pending', 'active', 'rejected', 'suspended');
create type public.order_status as enum ('pending', 'processing', 'shipped', 'delivered', 'cancelled');

-- 3. Create Tables

-- Profiles Table (Extends Supabase Auth users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  role public.user_role default 'buyer' not null,
  status public.profile_status default 'pending' not null,
  verif_doc_url text,
  first_name text,
  last_name text
);

-- Stores/Dentales
create table public.stores (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  reputation numeric(2,1) default 0.0,
  logo_url text,
  address_city text
);

-- Categories
create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  slug text not null unique,
  image_url text,
  description text
);

-- Brands
create table public.brands (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  slug text not null unique,
  logo_url text,
  country text
);

-- Exchange Rates
create table public.exchange_rates (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  rate_bcv numeric(10,4) not null,
  currency_from text default 'USD' not null,
  currency_to text default 'VES' not null,
  last_updated timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Products (Detailed)
create table public.products (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  store_id uuid references public.stores(id) on delete cascade not null,
  sku text not null, -- Unique per store logic handled in app or composite unique constraint
  title text not null,
  slug text not null unique,
  description text,
  price_usd numeric(10,2) not null,
  tax_rate numeric(5,2) default 0.0,
  stock integer default 0,
  weight numeric(10,2),
  dimensions jsonb default '{}'::jsonb,
  images text[] default array[]::text[],
  category_id uuid references public.categories(id) on delete set null,
  brand_id uuid references public.brands(id) on delete set null,
  is_active boolean default true,
  unique(store_id, sku) -- SKU must be unique within a single store
);

-- Product Variations
create table public.product_variations (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  product_id uuid references public.products(id) on delete cascade not null,
  attribute_name text not null, -- e.g., 'Color', 'Talla', 'Tono'
  value text not null,          -- e.g., 'A1', 'M', 'Rojo'
  stock integer default 0,
  sku_modifier text
);

-- Orders
create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  buyer_id uuid references public.profiles(id) on delete set null,
  total_usd numeric(10,2) not null,
  commission_total numeric(10,2) default 0.0,
  status public.order_status default 'pending' not null,
  payment_ref text
);

-- Order Items
create table public.order_items (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete set null,
  variation_id uuid references public.product_variations(id) on delete set null,
  store_id uuid references public.stores(id) on delete set null,
  unit_price_usd numeric(10,2) not null,
  quantity integer not null
);

-- Cart Items
create table public.cart_items (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  variation_id uuid references public.product_variations(id) on delete cascade,
  quantity integer not null default 1,
  unique nulls not distinct (user_id, product_id, variation_id)
);

-- 4. Enable RLS
alter table public.profiles enable row level security;
alter table public.stores enable row level security;
alter table public.categories enable row level security;
alter table public.brands enable row level security;
alter table public.exchange_rates enable row level security;
alter table public.products enable row level security;
alter table public.product_variations enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.cart_items enable row level security;

-- 5. Create Basic RLS Policies
-- Public Read Access for catalog data
create policy "Public Read Categories" on public.categories for select using (true);
create policy "Public Read Brands" on public.brands for select using (true);
create policy "Public Read Products" on public.products for select using (is_active = true);
create policy "Public Read Variations" on public.product_variations for select using (true);
create policy "Public Read Stores" on public.stores for select using (true);
create policy "Public Read Rates" on public.exchange_rates for select using (true);

-- Authenticated Users Policies (Basic setup, easily extensible)
create policy "Users can read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

create policy "Users can read own orders" on public.orders for select using (auth.uid() = buyer_id);
create policy "Users can create orders" on public.orders for insert with check (auth.uid() = buyer_id);

create policy "Users can manage own cart" on public.cart_items for all using (auth.uid() = user_id);

-- 6. Create Indexes for Performance
create index if not exists idx_products_store_id on public.products(store_id);
create index if not exists idx_products_category_id on public.products(category_id);
create index if not exists idx_products_brand_id on public.products(brand_id);
create index if not exists idx_products_slug on public.products(slug);
create index if not exists idx_variations_product_id on public.product_variations(product_id);
create index if not exists idx_orders_buyer_id on public.orders(buyer_id);
create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_order_items_store_id on public.order_items(store_id);
