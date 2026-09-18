-- Réinitialise complètement les policies RLS de public.profiles, puis les
-- recrée proprement. Contrairement à la migration précédente (qui ne
-- touchait que 3 policies nommées), celle-ci supprime TOUTES les policies
-- existantes sur la table, quel que soit leur nom — utile si une ancienne
-- policy oubliée (créée manuellement, ou par un ancien réglage du
-- dashboard) bloque encore les insert/update malgré la migration
-- précédente.
--
-- Idempotente : peut être ré-exécutée sans erreur, à tout moment.

do $$
declare
  pol record;
begin
  for pol in
    select policyname
    from pg_policies
    where schemaname = 'public' and tablename = 'profiles'
  loop
    execute format('drop policy if exists %I on public.profiles', pol.policyname);
  end loop;
end $$;

alter table public.profiles enable row level security;

-- Lecture publique (annuaire accessible sans connexion).
create policy "profiles_select_public"
on public.profiles
for select
to anon, authenticated
using (true);

-- Un utilisateur authentifié ne peut créer que sa propre ligne.
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

-- Un utilisateur authentifié ne peut modifier que sa propre ligne.
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);
