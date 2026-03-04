-- PolyFlow v1.1: allow custom manufacturer/category options from UI.
-- Replaces strict fixed-list checks with non-empty text checks.
-- This is retained for legacy projects where materials still use text columns.

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'materials'
      and column_name = 'manufacturer'
  ) then
    alter table public.materials
      drop constraint if exists materials_manufacturer_check;

    alter table public.materials
      drop constraint if exists materials_manufacturer_nonempty_check;

    alter table public.materials
      add constraint materials_manufacturer_nonempty_check
      check (char_length(trim(manufacturer)) >= 2);
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'materials'
      and column_name = 'category'
  ) then
    alter table public.materials
      drop constraint if exists materials_category_check;

    alter table public.materials
      drop constraint if exists materials_category_nonempty_check;

    alter table public.materials
      add constraint materials_category_nonempty_check
      check (char_length(trim(category)) >= 2);
  end if;
end;
$$;
