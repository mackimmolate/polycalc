-- PolyFlow v1.1 hotfix: remove legacy fixed-list checks on materials.category/materials.manufacturer.
-- Some projects still have strict check constraints from older schema versions.

do $$
declare
  constraint_row record;
begin
  for constraint_row in
    select c.conname
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    where n.nspname = 'public'
      and t.relname = 'materials'
      and c.contype = 'c'
      and (
        pg_get_constraintdef(c.oid) ilike '%manufacturer in (%'
        or pg_get_constraintdef(c.oid) ilike '%category in (%'
      )
  loop
    execute format('alter table public.materials drop constraint if exists %I', constraint_row.conname);
  end loop;
end;
$$;

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
