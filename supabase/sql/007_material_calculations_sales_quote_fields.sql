-- PolyFlow 0.6.0: sales-oriented quote fields on material_calculations.
-- Adds persisted inputs for internal cost, suggested sales price, batch totals, and lead-time estimation.

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

notify pgrst, 'reload schema';
