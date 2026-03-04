-- PolyFlow v1.1: per-material calculation scenarios
-- Calculations store user-entered scenario values.
-- Calculated values (for example material cost) stay derived in app logic.

create table if not exists public.material_calculations (
  id uuid primary key default gen_random_uuid(),
  material_id uuid not null references public.materials (id) on delete cascade,
  label text not null default '',
  kg_material numeric(10, 3) not null check (kg_material >= 0),
  print_time_hours numeric(10, 2) not null check (print_time_hours >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.set_material_calculations_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_material_calculations_updated_at on public.material_calculations;
create trigger trg_material_calculations_updated_at
before update on public.material_calculations
for each row
execute function public.set_material_calculations_updated_at();

create index if not exists idx_material_calculations_material_id
  on public.material_calculations (material_id);
create index if not exists idx_material_calculations_created_at
  on public.material_calculations (created_at);

alter table public.material_calculations enable row level security;

grant usage on schema public to anon, authenticated;
grant select on table public.material_calculations to anon, authenticated;
grant insert, update, delete on table public.material_calculations to authenticated;

drop policy if exists "material_calculations_select_public" on public.material_calculations;
create policy "material_calculations_select_public"
on public.material_calculations
for select
using (true);

drop policy if exists "material_calculations_insert_authenticated" on public.material_calculations;
create policy "material_calculations_insert_authenticated"
on public.material_calculations
for insert
to authenticated
with check (true);

drop policy if exists "material_calculations_update_authenticated" on public.material_calculations;
create policy "material_calculations_update_authenticated"
on public.material_calculations
for update
to authenticated
using (true)
with check (true);

drop policy if exists "material_calculations_delete_authenticated" on public.material_calculations;
create policy "material_calculations_delete_authenticated"
on public.material_calculations
for delete
to authenticated
using (true);
