-- PolyFlow v1.1: allow custom manufacturer/category options from UI.
-- Replaces strict fixed-list checks with non-empty text checks.

alter table public.materials
  drop constraint if exists materials_manufacturer_check;

alter table public.materials
  drop constraint if exists materials_category_check;

alter table public.materials
  drop constraint if exists materials_manufacturer_nonempty_check;

alter table public.materials
  drop constraint if exists materials_category_nonempty_check;

alter table public.materials
  add constraint materials_manufacturer_nonempty_check
  check (char_length(trim(manufacturer)) >= 2);

alter table public.materials
  add constraint materials_category_nonempty_check
  check (char_length(trim(category)) >= 2);
