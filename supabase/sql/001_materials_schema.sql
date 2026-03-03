-- PolyFlow v1: material library + simple calculator model
-- This schema stores fixed material values.
-- User-entered calculation inputs (kg material, printtid) are not persisted in v1.

create extension if not exists pgcrypto;

create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) >= 2),
  manufacturer text not null check (
    manufacturer in ('SUNLU', 'Bambu Lab', 'Polymaker', 'eSUN', 'Siraya Tech', 'Prusament')
  ),
  category text not null check (category in ('PLA', 'PETG', 'ABS', 'Nylon', 'TPU', 'Resin', 'Other')),
  price_per_kg_eur numeric(10, 2) not null check (price_per_kg_eur >= 0),
  max_temperature_c integer check (max_temperature_c is null or max_temperature_c >= 0),
  time_per_layer_45_deg_seconds integer not null check (time_per_layer_45_deg_seconds > 0),
  notes text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.set_materials_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_materials_updated_at on public.materials;
create trigger trg_materials_updated_at
before update on public.materials
for each row
execute function public.set_materials_updated_at();

create index if not exists idx_materials_name on public.materials (name);
create index if not exists idx_materials_manufacturer on public.materials (manufacturer);
create index if not exists idx_materials_category on public.materials (category);
