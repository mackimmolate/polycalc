-- PolyCalc 0.6.1: reference angle support for per-layer time.
-- Keeps existing time column in seconds and adds a selectable reference angle (45 or 90).

alter table public.materials
  add column if not exists time_per_layer_reference_angle_deg integer not null default 45;

alter table public.materials
  drop constraint if exists materials_time_per_layer_reference_angle_deg_check;
alter table public.materials
  add constraint materials_time_per_layer_reference_angle_deg_check
  check (time_per_layer_reference_angle_deg in (45, 90));

update public.materials
set time_per_layer_reference_angle_deg = 45
where time_per_layer_reference_angle_deg is null;

notify pgrst, 'reload schema';
