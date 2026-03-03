-- PolyFlow v1 RLS baseline
-- Goal: allow public read, but require authenticated session for write operations.
-- Destructive behavior in v1 is hard delete (no archive flow).

alter table public.materials enable row level security;

grant usage on schema public to anon, authenticated;
grant select on table public.materials to anon, authenticated;
grant insert, update, delete on table public.materials to authenticated;

drop policy if exists "materials_select_public" on public.materials;
create policy "materials_select_public"
on public.materials
for select
using (true);

drop policy if exists "materials_insert_authenticated" on public.materials;
create policy "materials_insert_authenticated"
on public.materials
for insert
to authenticated
with check (true);

drop policy if exists "materials_update_authenticated" on public.materials;
create policy "materials_update_authenticated"
on public.materials
for update
to authenticated
using (true)
with check (true);

drop policy if exists "materials_delete_authenticated" on public.materials;
create policy "materials_delete_authenticated"
on public.materials
for delete
to authenticated
using (true);
