-- PolyCalc v1.1+: per-material calculation scenarios
-- Calculations store user-entered scenario values.
-- Calculated values (for example material cost) stay derived in app logic.
-- Several legacy sales-oriented columns remain in this table for schema compatibility, even though the active frontend runtime no longer uses them.

create table if not exists public.material_calculations (
  id uuid primary key default gen_random_uuid(),
  material_id uuid not null references public.materials (id) on delete cascade,
  label text not null default '',
  kg_material numeric(10, 3) not null check (kg_material >= 0),
  print_time_hours numeric(10, 2) not null check (print_time_hours >= 0),
  quantity integer not null default 1 check (quantity > 0),
  machine_hourly_rate_eur numeric(10, 2) not null default 0 check (machine_hourly_rate_eur >= 0),
  labor_cost_per_part_eur numeric(10, 2) not null default 0 check (labor_cost_per_part_eur >= 0),
  post_process_cost_per_part_eur numeric(10, 2) not null default 0 check (post_process_cost_per_part_eur >= 0),
  setup_time_hours numeric(10, 2) not null default 0 check (setup_time_hours >= 0),
  post_process_time_hours_per_part numeric(10, 2) not null default 0 check (post_process_time_hours_per_part >= 0),
  risk_buffer_percent numeric(5, 2) not null default 10 check (risk_buffer_percent >= 0 and risk_buffer_percent <= 100),
  target_margin_percent numeric(5, 2) not null default 30 check (target_margin_percent >= 0 and target_margin_percent < 100),
  printer_count integer not null default 1 check (printer_count > 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.material_calculations
  add column if not exists quantity integer not null default 1;
alter table public.material_calculations
  add column if not exists machine_hourly_rate_eur numeric(10, 2) not null default 0;
alter table public.material_calculations
  add column if not exists labor_cost_per_part_eur numeric(10, 2) not null default 0;
alter table public.material_calculations
  add column if not exists post_process_cost_per_part_eur numeric(10, 2) not null default 0;
alter table public.material_calculations
  add column if not exists setup_time_hours numeric(10, 2) not null default 0;
alter table public.material_calculations
  add column if not exists post_process_time_hours_per_part numeric(10, 2) not null default 0;
alter table public.material_calculations
  add column if not exists risk_buffer_percent numeric(5, 2) not null default 10;
alter table public.material_calculations
  add column if not exists target_margin_percent numeric(5, 2) not null default 30;
alter table public.material_calculations
  add column if not exists printer_count integer not null default 1;

alter table public.material_calculations
  drop constraint if exists material_calculations_quantity_check;
alter table public.material_calculations
  add constraint material_calculations_quantity_check
  check (quantity > 0);

alter table public.material_calculations
  drop constraint if exists material_calculations_machine_hourly_rate_eur_check;
alter table public.material_calculations
  add constraint material_calculations_machine_hourly_rate_eur_check
  check (machine_hourly_rate_eur >= 0);

alter table public.material_calculations
  drop constraint if exists material_calculations_labor_cost_per_part_eur_check;
alter table public.material_calculations
  add constraint material_calculations_labor_cost_per_part_eur_check
  check (labor_cost_per_part_eur >= 0);

alter table public.material_calculations
  drop constraint if exists material_calculations_post_process_cost_per_part_eur_check;
alter table public.material_calculations
  add constraint material_calculations_post_process_cost_per_part_eur_check
  check (post_process_cost_per_part_eur >= 0);

alter table public.material_calculations
  drop constraint if exists material_calculations_setup_time_hours_check;
alter table public.material_calculations
  add constraint material_calculations_setup_time_hours_check
  check (setup_time_hours >= 0);

alter table public.material_calculations
  drop constraint if exists material_calculations_post_process_time_hours_per_part_check;
alter table public.material_calculations
  add constraint material_calculations_post_process_time_hours_per_part_check
  check (post_process_time_hours_per_part >= 0);

alter table public.material_calculations
  drop constraint if exists material_calculations_risk_buffer_percent_check;
alter table public.material_calculations
  add constraint material_calculations_risk_buffer_percent_check
  check (risk_buffer_percent >= 0 and risk_buffer_percent <= 100);

alter table public.material_calculations
  drop constraint if exists material_calculations_target_margin_percent_check;
alter table public.material_calculations
  add constraint material_calculations_target_margin_percent_check
  check (target_margin_percent >= 0 and target_margin_percent < 100);

alter table public.material_calculations
  drop constraint if exists material_calculations_printer_count_check;
alter table public.material_calculations
  add constraint material_calculations_printer_count_check
  check (printer_count > 0);

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
