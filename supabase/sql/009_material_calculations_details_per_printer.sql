-- PolyCalc 0.7.0: support multiple details per printer in one print run.
-- Adds a persisted capacity input used by lead-time and machine-cost calculations.

alter table public.material_calculations
  add column if not exists details_per_printer integer not null default 1;

update public.material_calculations
set details_per_printer = 1
where details_per_printer is null;

alter table public.material_calculations
  drop constraint if exists material_calculations_details_per_printer_check;
alter table public.material_calculations
  add constraint material_calculations_details_per_printer_check
  check (details_per_printer > 0);

notify pgrst, 'reload schema';
