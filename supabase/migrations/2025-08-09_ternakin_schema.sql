-- Ternakin schema, triggers, and RLS policies
-- This script is idempotent where possible. Run in Supabase SQL editor or via Management API.

-- Timestamp helper function (updated_at)
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Profiles table linking auth.users -> farms (each user belongs to exactly one farm)
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  farm_id uuid,
  full_name text,
  avatar_url text,
  created_at timestamp default now() not null,
  updated_at timestamp default now() not null
);

-- Trigger for profiles.updated_at
create or replace trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- Ensure profiles.farm_id references farms
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_farm_id_fkey'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_farm_id_fkey
      FOREIGN KEY (farm_id) REFERENCES public.farms(id) ON DELETE SET NULL;
  END IF;
END $$;


-- Farms
create table if not exists public.farms (
  id uuid primary key default gen_random_uuid(),
  name varchar(100) not null unique,
  address varchar(255),
  phone varchar(20),
  email varchar(150),
  currency varchar(20),
  account_type varchar(100) not null default 'subscription',
  subscription_level varchar(100) not null default 'freetrial',
  subscription_from date,
  subscription_to date,
  created_at timestamp default now() not null,
  updated_at timestamp default now() not null
);
create or replace trigger trg_farms_updated_at
before update on public.farms
for each row execute function public.set_updated_at();

-- Batches
create table if not exists public.batches (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms(id) on delete cascade,
  name varchar(100) not null,
  entry_date date,
  animal varchar(50) not null default 'chicken',
  breed varchar(50) not null default 'kub_2',
  starting_count integer,
  current_count integer,
  source varchar(100),
  total_cost numeric(20,4) not null default 0,
  total_income numeric(20,4) not null default 0,
  current_age_days integer not null default 0,
  current_age_weeks integer not null default 0,
  created_at timestamp default now() not null,
  updated_at timestamp default now() not null,
  constraint batches_farm_name_entry_unique unique (farm_id, name, entry_date)
);
-- Note: consider scoping the unique to farm_id if desired: unique (farm_id, name, entry_date)
create or replace trigger trg_batches_updated_at
before update on public.batches
for each row execute function public.set_updated_at();

-- Batches history
create table if not exists public.batches_history (
  id uuid primary key default gen_random_uuid(),
  batches_id uuid not null references public.batches(id) on delete cascade,
  type varchar(100),
  count integer,
  description text,
  total_price numeric(20,4) not null default 0,
  created_at timestamp default now() not null,
  updated_at timestamp default now() not null
);
create or replace trigger trg_batches_history_updated_at
before update on public.batches_history
for each row execute function public.set_updated_at();

-- Master growth (reference data, readable by all authenticated users)
create table if not exists public.master_growth (
  id uuid primary key default gen_random_uuid(),
  animal varchar(50) not null default 'chicken',
  breed varchar(50) not null default 'kub_2',
  age_in_week integer,
  feed_gr numeric(10,2),
  water_ml numeric(10,2),
  weight_male numeric(10,2),
  weight_female numeric(10,2),
  temperature numeric(5,2),
  lightning varchar(50),
  vaccine varchar(100),
  feed_rec varchar(255),
  created_at timestamp default now() not null,
  updated_at timestamp default now() not null
);
create or replace trigger trg_master_growth_updated_at
before update on public.master_growth
for each row execute function public.set_updated_at();

-- Recipes
create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms(id) on delete cascade,
  name varchar(100) not null unique,
  type varchar(100) not null default 'custom',
  used_for varchar(100) not null default 'grower',
  total_price_kg numeric(20,4),
  description text,
  created_at timestamp default now() not null,
  updated_at timestamp default now() not null
);
create or replace trigger trg_recipes_updated_at
before update on public.recipes
for each row execute function public.set_updated_at();

-- Recipe items
create table if not exists public.recipes_items (
  item_id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.recipes(id) on delete cascade,
  name varchar(100) not null,
  percentages numeric(5,2),
  price_kg numeric(20,4),
  created_at timestamp default now() not null,
  updated_at timestamp default now() not null
);
create or replace trigger trg_recipes_items_updated_at
before update on public.recipes_items
for each row execute function public.set_updated_at();

-- Feeding plan
create table if not exists public.feeding_plan (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms(id) on delete cascade,
  batches_id uuid not null references public.batches(id) on delete cascade,
  recipes_id uuid not null references public.recipes(id) on delete cascade,
  age_from_week integer,
  age_to_week integer,
  created_at timestamp default now() not null,
  updated_at timestamp default now() not null
);
create or replace trigger trg_feeding_plan_updated_at
before update on public.feeding_plan
for each row execute function public.set_updated_at();

-- Finance cashbook
create table if not exists public.finance_cashbook (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms(id) on delete cascade,
  debit numeric(20,4) not null default 0,
  credit numeric(20,4) not null default 0,
  balance numeric(20,4) not null default 0,
  transaction_date date,
  type varchar(100),
  notes varchar(255),
  batches_id uuid references public.batches(id) on delete set null,
  created_at timestamp default now() not null,
  updated_at timestamp default now() not null
);
create or replace trigger trg_finance_cashbook_updated_at
before update on public.finance_cashbook
for each row execute function public.set_updated_at();

-- Balance summary per farm
create table if not exists public.balance (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms(id) on delete cascade,
  total_balance numeric(20,4) not null default 0,
  total_debit numeric(20,4) not null default 0,
  total_credit numeric(20,4) not null default 0,
  created_at timestamp default now() not null,
  updated_at timestamp default now() not null
);
create or replace trigger trg_balance_updated_at
before update on public.balance
for each row execute function public.set_updated_at();

-- Animals
create table if not exists public.animals (
  id uuid primary key default gen_random_uuid(),
  animal varchar(150),
  breed varchar(150),
  classification varchar(150),
  created_at timestamp default now() not null,
  updated_at timestamp default now() not null
);
create or replace trigger trg_animals_updated_at
before update on public.animals
for each row execute function public.set_updated_at();

-- Helpful indexes
create index if not exists idx_batches_farm on public.batches(farm_id);
create index if not exists idx_recipes_farm on public.recipes(farm_id);
create index if not exists idx_cashbook_farm_date on public.finance_cashbook(farm_id, transaction_date);
create unique index if not exists idx_balance_farm_unique on public.balance(farm_id);

-- RLS enablement
alter table public.profiles enable row level security;
alter table public.farms enable row level security;
alter table public.batches enable row level security;
alter table public.batches_history enable row level security;
alter table public.master_growth enable row level security;
alter table public.recipes enable row level security;
alter table public.recipes_items enable row level security;
alter table public.feeding_plan enable row level security;
alter table public.finance_cashbook enable row level security;
alter table public.balance enable row level security;

-- Helper: current user's farm_id
create or replace view public.current_user_farm as
select p.user_id, p.farm_id
from public.profiles p
where p.user_id = auth.uid();

-- Policies
-- profiles: users can read/update own profile; only service role can insert/delete
create policy if not exists "profiles_read_own"
  on public.profiles for select
  using (user_id = auth.uid());
create policy if not exists "profiles_update_own"
  on public.profiles for update
  using (user_id = auth.uid());

-- farms: users can select only their farm; insert/update restricted to authenticated for now, but only if they own it via profiles
create policy if not exists "farms_select_by_members"
  on public.farms for select
  using (id = (select farm_id from public.profiles where user_id = auth.uid()));
create policy if not exists "farms_update_by_members"
  on public.farms for update
  using (id = (select farm_id from public.profiles where user_id = auth.uid()));
create policy if not exists "farms_insert_auth"
  on public.farms for insert
  with check (auth.role() = 'authenticated');

-- batches: match by farm via profiles
create policy if not exists "batches_select_by_farm"
  on public.batches for select
  using (farm_id = (select farm_id from public.profiles where user_id = auth.uid()));
create policy if not exists "batches_mod_by_farm"
  on public.batches for all
  using (farm_id = (select farm_id from public.profiles where user_id = auth.uid()))
  with check (farm_id = (select farm_id from public.profiles where user_id = auth.uid()));

-- batches_history: via join to batches
create policy if not exists "batches_history_select"
  on public.batches_history for select
  using (exists (
    select 1 from public.batches b
    where b.id = batches_id
      and b.farm_id = (select farm_id from public.profiles where user_id = auth.uid())
  ));
create policy if not exists "batches_history_mod"
  on public.batches_history for all
  using (exists (
    select 1 from public.batches b
    where b.id = batches_id
      and b.farm_id = (select farm_id from public.profiles where user_id = auth.uid())
  ))
  with check (exists (
    select 1 from public.batches b
    where b.id = batches_id
      and b.farm_id = (select farm_id from public.profiles where user_id = auth.uid())
  ));

-- master_growth: read for all authenticated, no writes
create policy if not exists "master_growth_read_auth"
  on public.master_growth for select
  using (auth.role() = 'authenticated');

-- recipes and items: by farm via parent
create policy if not exists "recipes_by_farm"
  on public.recipes for all
  using (farm_id = (select farm_id from public.profiles where user_id = auth.uid()))
  with check (farm_id = (select farm_id from public.profiles where user_id = auth.uid()));
create policy if not exists "recipes_items_select"
  on public.recipes_items for select
  using (exists (
    select 1 from public.recipes r where r.id = parent_id and r.farm_id = (select farm_id from public.profiles where user_id = auth.uid())
  ));
create policy if not exists "recipes_items_mod"
  on public.recipes_items for all
  using (exists (
    select 1 from public.recipes r where r.id = parent_id and r.farm_id = (select farm_id from public.profiles where user_id = auth.uid())
  ))
  with check (exists (
    select 1 from public.recipes r where r.id = parent_id and r.farm_id = (select farm_id from public.profiles where user_id = auth.uid())
  ));

-- feeding_plan: by farm
create policy if not exists "feeding_plan_by_farm"
  on public.feeding_plan for all
  using (farm_id = (select farm_id from public.profiles where user_id = auth.uid()))
  with check (farm_id = (select farm_id from public.profiles where user_id = auth.uid()));

-- finance_cashbook: by farm
create policy if not exists "finance_cashbook_by_farm"
  on public.finance_cashbook for all
  using (farm_id = (select farm_id from public.profiles where user_id = auth.uid()))
  with check (farm_id = (select farm_id from public.profiles where user_id = auth.uid()));

-- balance: by farm
create policy if not exists "balance_by_farm"
  on public.balance for all
  using (farm_id = (select farm_id from public.profiles where user_id = auth.uid()))
  with check (farm_id = (select farm_id from public.profiles where user_id = auth.uid()));

-- Optional: trigger to ensure a profile row exists when a user signs up
-- Supabase provides a sample for this; include safely
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, created_at, updated_at)
  values (new.id, now(), now())
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Attach to auth.users (only if not already attached)
do $$
begin
  if not exists (
      select 1 from pg_trigger
      where tgname = 'on_auth_user_created') then
    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute function public.handle_new_user();
  end if;
end $$;

