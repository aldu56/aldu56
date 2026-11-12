-- =====================================================================
-- ÉLORIA SKIN • HAIR — core schema
-- Customers may own a Smart Mirror, a Smart Comb, or both. Every feature
-- is gated by device ownership, enforced here with Row Level Security.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------
do $$ begin
  create type public.device_type as enum ('mirror', 'comb');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.analysis_kind as enum ('skin', 'scalp');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.order_status as enum ('pending', 'paid', 'shipped', 'delivered', 'cancelled');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------
-- Generic updated_at trigger
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------------------------------------------------------------------
-- Profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  skin_type text check (skin_type in ('dry', 'oily', 'combination', 'normal', 'sensitive')),
  hair_type text check (hair_type in ('straight', 'wavy', 'curly', 'coily')),
  concerns text[] not null default '{}',
  birth_year int check (birth_year between 1900 and 2100),
  marketing_opt_in boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- Device registry: every serial number ÉLORIA manufactures.
-- Not readable by clients; only claim_device() touches it.
-- ---------------------------------------------------------------------
create table if not exists public.device_registry (
  serial text primary key check (serial ~ '^EL[MC]-[A-Z0-9]{4}-[A-Z0-9]{4}$'),
  device_type public.device_type not null,
  manufactured_at timestamptz not null default now(),
  claimed_by uuid references auth.users (id) on delete set null,
  claimed_at timestamptz
);

-- ---------------------------------------------------------------------
-- Devices owned by customers
-- ---------------------------------------------------------------------
create table if not exists public.devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  device_type public.device_type not null,
  serial text not null unique references public.device_registry (serial),
  nickname text not null default '',
  firmware_version text not null default '1.0.0',
  paired_at timestamptz not null default now(),
  last_used_at timestamptz
);
create index if not exists devices_user_idx on public.devices (user_id);

-- ---------------------------------------------------------------------
-- Skin analyses (Smart Mirror)
-- ---------------------------------------------------------------------
create table if not exists public.skin_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  device_id uuid references public.devices (id) on delete set null,
  image_path text,
  overall_score int not null check (overall_score between 0 and 100),
  hydration int not null check (hydration between 0 and 100),
  oiliness int not null check (oiliness between 0 and 100),
  pores int not null check (pores between 0 and 100),
  wrinkles int not null check (wrinkles between 0 and 100),
  redness int not null check (redness between 0 and 100),
  pigmentation int not null check (pigmentation between 0 and 100),
  elasticity int not null check (elasticity between 0 and 100),
  skin_type text not null,
  summary text not null default '',
  observations text[] not null default '{}',
  source text not null default 'vision-engine' check (source in ('vision-engine', 'ai')),
  created_at timestamptz not null default now()
);
create index if not exists skin_analyses_user_idx on public.skin_analyses (user_id, created_at desc);

-- ---------------------------------------------------------------------
-- Scalp analyses (Smart Comb)
-- ---------------------------------------------------------------------
create table if not exists public.scalp_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  device_id uuid references public.devices (id) on delete set null,
  image_path text,
  overall_score int not null check (overall_score between 0 and 100),
  hydration int not null check (hydration between 0 and 100),
  oiliness int not null check (oiliness between 0 and 100),
  flaking int not null check (flaking between 0 and 100),
  sensitivity int not null check (sensitivity between 0 and 100),
  density int not null check (density between 0 and 100),
  follicle_health int not null check (follicle_health between 0 and 100),
  scalp_type text not null,
  summary text not null default '',
  observations text[] not null default '{}',
  source text not null default 'vision-engine' check (source in ('vision-engine', 'ai')),
  created_at timestamptz not null default now()
);
create index if not exists scalp_analyses_user_idx on public.scalp_analyses (user_id, created_at desc);

-- ---------------------------------------------------------------------
-- Personalized recommendations
-- ---------------------------------------------------------------------
create table if not exists public.recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind public.analysis_kind not null,
  analysis_id uuid not null,
  title text not null,
  body text not null,
  category text not null,
  priority int not null default 2 check (priority between 1 and 3),
  product_slug text,
  created_at timestamptz not null default now()
);
create index if not exists recommendations_analysis_idx on public.recommendations (analysis_id);
create index if not exists recommendations_user_idx on public.recommendations (user_id, kind, created_at desc);

-- ---------------------------------------------------------------------
-- Daily routines (regenerated after each analysis) + completion log
-- ---------------------------------------------------------------------
create table if not exists public.routine_steps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind public.analysis_kind not null,
  time_of_day text not null check (time_of_day in ('morning', 'evening', 'weekly')),
  step_order int not null,
  title text not null,
  description text not null default '',
  product_slug text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists routine_steps_user_idx on public.routine_steps (user_id, kind, active);

create table if not exists public.routine_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  step_id uuid not null references public.routine_steps (id) on delete cascade,
  completed_on date not null default current_date,
  unique (step_id, completed_on)
);
create index if not exists routine_completions_user_idx on public.routine_completions (user_id, completed_on);

-- ---------------------------------------------------------------------
-- Commerce
-- ---------------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  status public.order_status not null default 'pending',
  subtotal_cents int not null check (subtotal_cents >= 0),
  shipping_cents int not null default 0 check (shipping_cents >= 0),
  total_cents int not null check (total_cents >= 0),
  currency text not null default 'EUR',
  shipping_name text not null,
  shipping_address text not null,
  shipping_city text not null,
  shipping_postal_code text not null,
  shipping_country text not null,
  phone text,
  created_at timestamptz not null default now()
);
create index if not exists orders_user_idx on public.orders (user_id, created_at desc);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_slug text not null,
  product_name text not null,
  unit_price_cents int not null check (unit_price_cents >= 0),
  quantity int not null check (quantity between 1 and 20)
);
create index if not exists order_items_order_idx on public.order_items (order_id);

-- ---------------------------------------------------------------------
-- Public forms
-- ---------------------------------------------------------------------
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 254),
  topic text not null default 'general',
  message text not null check (char_length(message) between 1 and 5000),
  created_at timestamptz not null default now()
);

create table if not exists public.newsletter_subscribers (
  email text primary key check (char_length(email) between 3 and 254),
  created_at timestamptz not null default now()
);

-- =====================================================================
-- Ownership helper + device claiming
-- =====================================================================
create or replace function public.owns_device_type(t public.device_type)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.devices d where d.user_id = auth.uid() and d.device_type = t);
$$;

-- Claims a manufactured serial for the calling user. Returns the device row.
create or replace function public.claim_device(p_serial text, p_nickname text default '')
returns public.devices
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_reg public.device_registry;
  v_dev public.devices;
  v_serial text := upper(trim(p_serial));
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  select * into v_reg from public.device_registry where serial = v_serial for update;
  if not found then
    raise exception 'serial_not_found' using errcode = 'P0002';
  end if;

  if v_reg.claimed_by is not null and v_reg.claimed_by <> v_uid then
    raise exception 'serial_already_claimed' using errcode = '23505';
  end if;

  if v_reg.claimed_by = v_uid then
    select * into v_dev from public.devices where serial = v_serial;
    return v_dev;
  end if;

  update public.device_registry set claimed_by = v_uid, claimed_at = now() where serial = v_serial;

  insert into public.devices (user_id, device_type, serial, nickname)
  values (
    v_uid,
    v_reg.device_type,
    v_serial,
    coalesce(nullif(trim(p_nickname), ''),
      case v_reg.device_type when 'mirror' then 'My Smart Mirror' else 'My Smart Comb' end)
  )
  returning * into v_dev;

  return v_dev;
end $$;

-- Releases a device so it can be transferred/resold.
create or replace function public.release_device(p_device_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_serial text;
begin
  delete from public.devices where id = p_device_id and user_id = auth.uid() returning serial into v_serial;
  if v_serial is null then
    raise exception 'device_not_found' using errcode = 'P0002';
  end if;
  update public.device_registry set claimed_by = null, claimed_at = null where serial = v_serial;
end $$;

revoke all on function public.claim_device(text, text) from public, anon;
revoke all on function public.release_device(uuid) from public, anon;
grant execute on function public.claim_device(text, text) to authenticated;
grant execute on function public.release_device(uuid) to authenticated;
grant execute on function public.owns_device_type(public.device_type) to authenticated;

-- =====================================================================
-- Row Level Security
-- =====================================================================
alter table public.profiles enable row level security;
alter table public.device_registry enable row level security;
alter table public.devices enable row level security;
alter table public.skin_analyses enable row level security;
alter table public.scalp_analyses enable row level security;
alter table public.recommendations enable row level security;
alter table public.routine_steps enable row level security;
alter table public.routine_completions enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.contact_messages enable row level security;
alter table public.newsletter_subscribers enable row level security;

-- profiles
create policy "profiles: read own" on public.profiles for select to authenticated using (id = auth.uid());
create policy "profiles: update own" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- device_registry: no policies => no client access.

-- devices (insert/delete only through claim_device / release_device)
create policy "devices: read own" on public.devices for select to authenticated using (user_id = auth.uid());
create policy "devices: update own" on public.devices for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- skin analyses: require an owned Smart Mirror
create policy "skin: read own" on public.skin_analyses for select to authenticated using (user_id = auth.uid());
create policy "skin: insert with mirror" on public.skin_analyses for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (select 1 from public.devices d where d.id = device_id and d.user_id = auth.uid() and d.device_type = 'mirror')
  );
create policy "skin: delete own" on public.skin_analyses for delete to authenticated using (user_id = auth.uid());

-- scalp analyses: require an owned Smart Comb
create policy "scalp: read own" on public.scalp_analyses for select to authenticated using (user_id = auth.uid());
create policy "scalp: insert with comb" on public.scalp_analyses for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (select 1 from public.devices d where d.id = device_id and d.user_id = auth.uid() and d.device_type = 'comb')
  );
create policy "scalp: delete own" on public.scalp_analyses for delete to authenticated using (user_id = auth.uid());

-- recommendations
create policy "reco: read own" on public.recommendations for select to authenticated using (user_id = auth.uid());
create policy "reco: insert own" on public.recommendations for insert to authenticated
  with check (user_id = auth.uid() and public.owns_device_type(case kind when 'skin' then 'mirror'::public.device_type else 'comb'::public.device_type end));
create policy "reco: delete own" on public.recommendations for delete to authenticated using (user_id = auth.uid());

-- routines
create policy "routine: read own" on public.routine_steps for select to authenticated using (user_id = auth.uid());
create policy "routine: insert own" on public.routine_steps for insert to authenticated
  with check (user_id = auth.uid() and public.owns_device_type(case kind when 'skin' then 'mirror'::public.device_type else 'comb'::public.device_type end));
create policy "routine: update own" on public.routine_steps for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "routine: delete own" on public.routine_steps for delete to authenticated using (user_id = auth.uid());

create policy "completion: read own" on public.routine_completions for select to authenticated using (user_id = auth.uid());
create policy "completion: insert own" on public.routine_completions for insert to authenticated
  with check (user_id = auth.uid() and exists (select 1 from public.routine_steps s where s.id = step_id and s.user_id = auth.uid()));
create policy "completion: delete own" on public.routine_completions for delete to authenticated using (user_id = auth.uid());

-- orders
create policy "orders: read own" on public.orders for select to authenticated using (user_id = auth.uid());
create policy "orders: insert own" on public.orders for insert to authenticated with check (user_id = auth.uid() and status = 'pending');
create policy "items: read own" on public.order_items for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "items: insert own" on public.order_items for insert to authenticated
  with check (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid() and o.status = 'pending'));

-- public forms: write-only for everyone
create policy "contact: anyone can write" on public.contact_messages for insert to anon, authenticated with check (true);
create policy "newsletter: anyone can subscribe" on public.newsletter_subscribers for insert to anon, authenticated with check (true);

-- =====================================================================
-- Storage: private bucket, one folder per user (<uid>/...)
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('scans', 'scans', false, 8388608, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "scans: read own" on storage.objects for select to authenticated
  using (bucket_id = 'scans' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "scans: upload own" on storage.objects for insert to authenticated
  with check (bucket_id = 'scans' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "scans: delete own" on storage.objects for delete to authenticated
  using (bucket_id = 'scans' and (storage.foldername(name))[1] = auth.uid()::text);
