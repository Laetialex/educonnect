-- Corrige les policies RLS de la table profiles :
-- - lecture publique (annuaire accessible sans connexion)
-- - un utilisateur authentifié ne peut créer/modifier que sa propre ligne
--   (id = auth.uid())
--
-- Idempotent : peut être ré-exécutée sans erreur.

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_public" on public.profiles;
create policy "profiles_select_public"
on public.profiles
for select
to anon, authenticated
using (true);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);
