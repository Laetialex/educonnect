-- Corrige les policies RLS de public.profiles ET affiche le résultat final,
-- pour vérifier immédiatement (dans le SQL Editor) que la correction a bien
-- été appliquée — sans avoir besoin de lancer une deuxième requête.
--
-- Rappel : profiles.id EST auth.users.id (convention Supabase standard,
-- confirmée par le schéma d'origine et par toutes les clés étrangères des
-- autres tables). Il n'existe pas et il ne faut pas de colonne user_id
-- séparée.
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

-- Un utilisateur authentifié ne peut créer que sa propre ligne
-- (profiles.id = auth.uid(), pas de colonne user_id séparée).
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

-- Preuve visuelle : cette requête doit renvoyer exactement 3 lignes
-- (profiles_select_public / profiles_insert_own / profiles_update_own).
-- Si ce n'est pas le cas après avoir exécuté ce script, le problème est
-- ailleurs (droits d'exécution, mauvais projet Supabase sélectionné, etc.)
-- et il faut me copier ce résultat tel quel.
select policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public' and tablename = 'profiles'
order by policyname;
