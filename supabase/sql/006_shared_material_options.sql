-- PolyFlow v2.2: shared canonical category/manufacturer options in Supabase.
-- Moves materials to foreign-key references and keeps option removal safe via is_active.

create extension if not exists pgcrypto;

create or replace function public.normalize_material_option_key(raw_value text)
returns text
language sql
immutable
as $$
  select lower(regexp_replace(trim(coalesce(raw_value, '')), '\s+', ' ', 'g'));
$$;

create or replace function public.set_material_option_normalized_key()
returns trigger
language plpgsql
as $$
begin
  new.label := regexp_replace(trim(new.label), '\s+', ' ', 'g');
  new.normalized_key := public.normalize_material_option_key(new.label);
  return new;
end;
$$;

create or replace function public.set_material_option_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.material_categories (
  id uuid primary key default gen_random_uuid(),
  label text not null check (char_length(trim(label)) >= 2),
  normalized_key text not null check (char_length(trim(normalized_key)) >= 2),
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.material_manufacturers (
  id uuid primary key default gen_random_uuid(),
  label text not null check (char_length(trim(label)) >= 2),
  normalized_key text not null check (char_length(trim(normalized_key)) >= 2),
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists trg_material_categories_normalized_key on public.material_categories;
create trigger trg_material_categories_normalized_key
before insert or update on public.material_categories
for each row
execute function public.set_material_option_normalized_key();

drop trigger if exists trg_material_manufacturers_normalized_key on public.material_manufacturers;
create trigger trg_material_manufacturers_normalized_key
before insert or update on public.material_manufacturers
for each row
execute function public.set_material_option_normalized_key();

drop trigger if exists trg_material_categories_updated_at on public.material_categories;
create trigger trg_material_categories_updated_at
before update on public.material_categories
for each row
execute function public.set_material_option_updated_at();

drop trigger if exists trg_material_manufacturers_updated_at on public.material_manufacturers;
create trigger trg_material_manufacturers_updated_at
before update on public.material_manufacturers
for each row
execute function public.set_material_option_updated_at();

create unique index if not exists uq_material_categories_normalized_key
  on public.material_categories (normalized_key);
create unique index if not exists uq_material_manufacturers_normalized_key
  on public.material_manufacturers (normalized_key);

create index if not exists idx_material_categories_active_label
  on public.material_categories (is_active, label);
create index if not exists idx_material_manufacturers_active_label
  on public.material_manufacturers (is_active, label);

insert into public.material_categories (label, is_active)
values
  ('PLA', true),
  ('PETG', true),
  ('ABS', true),
  ('Nylon', true),
  ('TPU', true),
  ('Resin', true)
on conflict (normalized_key)
do update
set is_active = true;

insert into public.material_manufacturers (label, is_active)
values
  ('SUNLU', true),
  ('Bambu Lab', true),
  ('Polymaker', true),
  ('eSUN', true),
  ('Siraya Tech', true),
  ('Prusament', true)
on conflict (normalized_key)
do update
set is_active = true;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'materials'
      and column_name = 'category'
  ) then
    insert into public.material_categories (label, is_active)
    select distinct regexp_replace(trim(m.category), '\s+', ' ', 'g') as label, true
    from public.materials m
    where char_length(trim(m.category)) >= 2
    on conflict (normalized_key)
    do update
    set is_active = true;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'materials'
      and column_name = 'manufacturer'
  ) then
    insert into public.material_manufacturers (label, is_active)
    select distinct regexp_replace(trim(m.manufacturer), '\s+', ' ', 'g') as label, true
    from public.materials m
    where char_length(trim(m.manufacturer)) >= 2
    on conflict (normalized_key)
    do update
    set is_active = true;
  end if;
end;
$$;

alter table public.materials
  add column if not exists category_id uuid;

alter table public.materials
  add column if not exists manufacturer_id uuid;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'materials'
      and column_name = 'category'
  ) then
    update public.materials m
    set category_id = c.id
    from public.material_categories c
    where c.normalized_key = public.normalize_material_option_key(m.category)
      and m.category_id is null;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'materials'
      and column_name = 'manufacturer'
  ) then
    update public.materials m
    set manufacturer_id = mf.id
    from public.material_manufacturers mf
    where mf.normalized_key = public.normalize_material_option_key(m.manufacturer)
      and m.manufacturer_id is null;
  end if;
end;
$$;

do $$
begin
  if exists (select 1 from public.materials where category_id is null) then
    raise exception 'Cannot complete migration: one or more materials are missing category_id.';
  end if;

  if exists (select 1 from public.materials where manufacturer_id is null) then
    raise exception 'Cannot complete migration: one or more materials are missing manufacturer_id.';
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'materials_category_id_fkey'
      and conrelid = 'public.materials'::regclass
  ) then
    alter table public.materials
      add constraint materials_category_id_fkey
      foreign key (category_id)
      references public.material_categories (id)
      on update restrict
      on delete restrict;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'materials_manufacturer_id_fkey'
      and conrelid = 'public.materials'::regclass
  ) then
    alter table public.materials
      add constraint materials_manufacturer_id_fkey
      foreign key (manufacturer_id)
      references public.material_manufacturers (id)
      on update restrict
      on delete restrict;
  end if;
end;
$$;

alter table public.materials
  alter column category_id set not null;

alter table public.materials
  alter column manufacturer_id set not null;

create index if not exists idx_materials_category_id
  on public.materials (category_id);
create index if not exists idx_materials_manufacturer_id
  on public.materials (manufacturer_id);

alter table public.materials
  drop constraint if exists materials_category_check;
alter table public.materials
  drop constraint if exists materials_category_nonempty_check;
alter table public.materials
  drop constraint if exists materials_manufacturer_check;
alter table public.materials
  drop constraint if exists materials_manufacturer_nonempty_check;

drop index if exists public.idx_materials_category;
drop index if exists public.idx_materials_manufacturer;

alter table public.materials
  drop column if exists category;
alter table public.materials
  drop column if exists manufacturer;

alter table public.material_categories enable row level security;
alter table public.material_manufacturers enable row level security;

grant usage on schema public to anon, authenticated;
grant select on table public.material_categories to anon, authenticated;
grant select on table public.material_manufacturers to anon, authenticated;
grant insert, update on table public.material_categories to authenticated;
grant insert, update on table public.material_manufacturers to authenticated;
revoke delete on table public.material_categories from anon, authenticated;
revoke delete on table public.material_manufacturers from anon, authenticated;

drop policy if exists "material_categories_select_public" on public.material_categories;
create policy "material_categories_select_public"
on public.material_categories
for select
using (true);

drop policy if exists "material_categories_insert_authenticated" on public.material_categories;
create policy "material_categories_insert_authenticated"
on public.material_categories
for insert
to authenticated
with check (true);

drop policy if exists "material_categories_update_authenticated" on public.material_categories;
create policy "material_categories_update_authenticated"
on public.material_categories
for update
to authenticated
using (true)
with check (true);

drop policy if exists "material_manufacturers_select_public" on public.material_manufacturers;
create policy "material_manufacturers_select_public"
on public.material_manufacturers
for select
using (true);

drop policy if exists "material_manufacturers_insert_authenticated" on public.material_manufacturers;
create policy "material_manufacturers_insert_authenticated"
on public.material_manufacturers
for insert
to authenticated
with check (true);

drop policy if exists "material_manufacturers_update_authenticated" on public.material_manufacturers;
create policy "material_manufacturers_update_authenticated"
on public.material_manufacturers
for update
to authenticated
using (true)
with check (true);

notify pgrst, 'reload schema';
