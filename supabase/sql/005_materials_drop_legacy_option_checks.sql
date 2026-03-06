-- PolyCalc v1.1 hotfix: remove legacy fixed-list checks on materials.category/materials.manufacturer.
-- Some projects still have strict check constraints from older schema versions.

do $$
declare
  constraint_row record;
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'materials'
      and column_name in ('manufacturer', 'category')
  ) then
    return;
  end if;

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
      drop constraint if exists materials_category_nonempty_check;

    alter table public.materials
      add constraint materials_category_nonempty_check
      check (char_length(trim(category)) >= 2);
  end if;
end;
$$;
