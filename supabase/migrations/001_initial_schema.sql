-- ============================================================
-- FloHops MVP — Initial Schema
-- Run this in your Supabase SQL editor (or via Supabase CLI).
-- ============================================================

-- ─── Enable UUID extension ───────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── breweries ───────────────────────────────────────────────
create table if not exists breweries (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text not null unique,
  description   text,
  address       text,
  city          text,
  state         text not null default 'FL',
  zip           text,
  lat           float8,
  lng           float8,
  phone         text,
  website       text,
  hours         jsonb,
  -- Attributes
  kid_friendly    boolean not null default false,
  dog_friendly    boolean not null default false,
  has_food        boolean not null default false,
  has_food_trucks boolean not null default false,
  outdoor_seating boolean not null default false,
  covered_outdoor boolean not null default false,
  has_wine        boolean not null default false,
  full_bar        boolean not null default false,
  sober_options   boolean not null default false,
  -- Meta
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists breweries_city_idx on breweries (city);
create index if not exists breweries_is_active_idx on breweries (is_active);

-- Auto-update updated_at on any row change
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger breweries_updated_at
  before update on breweries
  for each row execute function update_updated_at();

-- ─── brewery_photos ──────────────────────────────────────────
create table if not exists brewery_photos (
  id            uuid primary key default gen_random_uuid(),
  brewery_id    uuid not null references breweries(id) on delete cascade,
  storage_path  text not null,
  is_primary    boolean not null default false,
  display_order int not null default 0,
  created_at    timestamptz not null default now()
);

create index if not exists brewery_photos_brewery_idx on brewery_photos (brewery_id);

-- ─── events ──────────────────────────────────────────────────
create table if not exists events (
  id              uuid primary key default gen_random_uuid(),
  brewery_id      uuid not null references breweries(id) on delete cascade,
  title           text not null,
  description     text,
  start_at        timestamptz,
  end_at          timestamptz,
  is_recurring    boolean not null default false,
  recurrence_rule text,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists events_brewery_idx on events (brewery_id);
create index if not exists events_is_active_idx on events (is_active);

create trigger events_updated_at
  before update on events
  for each row execute function update_updated_at();

-- ─── user_profiles ───────────────────────────────────────────
create table if not exists user_profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        text not null default 'consumer'
                check (role in ('admin', 'brewery', 'consumer')),
  brewery_id  uuid references breweries(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- Auto-create a profile row when a new user signs up
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into user_profiles (id, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'consumer')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ─── favorites ───────────────────────────────────────────────
create table if not exists favorites (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  brewery_id  uuid not null references breweries(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (user_id, brewery_id)
);

create index if not exists favorites_user_idx on favorites (user_id);

-- ─── change_requests ─────────────────────────────────────────
create table if not exists change_requests (
  id              uuid primary key default gen_random_uuid(),
  type            text not null
                    check (type in ('correction', 'profile_update', 'event_request')),
  status          text not null default 'pending'
                    check (status in ('pending', 'approved', 'rejected')),
  brewery_id      uuid not null references breweries(id) on delete cascade,
  submitted_by    uuid references auth.users(id) on delete set null,
  submitter_name  text,
  submitter_email text,
  payload         jsonb not null default '{}',
  admin_notes     text,
  reviewed_by     uuid references auth.users(id) on delete set null,
  reviewed_at     timestamptz,
  created_at      timestamptz not null default now()
);

create index if not exists change_requests_status_idx on change_requests (status);
create index if not exists change_requests_brewery_idx on change_requests (brewery_id);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table breweries       enable row level security;
alter table brewery_photos  enable row level security;
alter table events          enable row level security;
alter table user_profiles   enable row level security;
alter table favorites       enable row level security;
alter table change_requests enable row level security;

-- Helper: is the current user an admin?
create or replace function is_admin()
returns boolean language sql security definer as $$
  select exists (
    select 1 from user_profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ─── breweries RLS ───────────────────────────────────────────
-- Public read for active breweries
create policy "breweries_public_read"
  on breweries for select
  using (is_active = true);

-- Admins can see all (including inactive)
create policy "breweries_admin_read_all"
  on breweries for select
  using (is_admin());

create policy "breweries_admin_insert"
  on breweries for insert
  with check (is_admin());

create policy "breweries_admin_update"
  on breweries for update
  using (is_admin());

create policy "breweries_admin_delete"
  on breweries for delete
  using (is_admin());

-- ─── brewery_photos RLS ──────────────────────────────────────
create policy "photos_public_read"
  on brewery_photos for select
  using (true);

create policy "photos_admin_insert"
  on brewery_photos for insert
  with check (is_admin());

create policy "photos_admin_update"
  on brewery_photos for update
  using (is_admin());

create policy "photos_admin_delete"
  on brewery_photos for delete
  using (is_admin());

-- ─── events RLS ──────────────────────────────────────────────
create policy "events_public_read"
  on events for select
  using (is_active = true);

create policy "events_admin_read_all"
  on events for select
  using (is_admin());

create policy "events_admin_insert"
  on events for insert
  with check (is_admin());

create policy "events_admin_update"
  on events for update
  using (is_admin());

create policy "events_admin_delete"
  on events for delete
  using (is_admin());

-- ─── user_profiles RLS ───────────────────────────────────────
-- Users can read their own profile
create policy "profiles_own_read"
  on user_profiles for select
  using (id = auth.uid());

-- Admins can read all profiles
create policy "profiles_admin_read_all"
  on user_profiles for select
  using (is_admin());

-- Admins can update roles
create policy "profiles_admin_update"
  on user_profiles for update
  using (is_admin());

-- ─── favorites RLS ───────────────────────────────────────────
create policy "favorites_own_read"
  on favorites for select
  using (user_id = auth.uid());

create policy "favorites_own_insert"
  on favorites for insert
  with check (user_id = auth.uid());

create policy "favorites_own_delete"
  on favorites for delete
  using (user_id = auth.uid());

-- ─── change_requests RLS ─────────────────────────────────────
-- Anyone (including anonymous) can submit
create policy "requests_public_insert"
  on change_requests for insert
  with check (true);

-- Only admins can read the queue
create policy "requests_admin_read"
  on change_requests for select
  using (is_admin());

-- Only admins can update (approve/reject)
create policy "requests_admin_update"
  on change_requests for update
  using (is_admin());

-- ============================================================
-- Supabase Storage bucket
-- Create the "brewery-photos" bucket in the Supabase dashboard
-- (Storage → New bucket → Name: brewery-photos → Public: true)
-- or run the following via the Supabase management API.
-- ============================================================
