-- Corrige la contrainte CHECK sur profiles.role : la création d'un
-- profil professeur échouait avec
--   "new row for relation 'profiles' violates check constraint
--    'profiles_role_check'"
--
-- Cause : le code (types/database.ts, ProfilForm.tsx, actions.ts, et
-- toutes les pages qui comparent p.role === "professeur") envoie et
-- attend exactement les valeurs "eleve" et "professeur" — vérifié dans
-- tout le projet, aucune incohérence côté code (pas de faute de
-- frappe, d'accent ou d'espace). La contrainte existante sur la base
-- n'autorisait donc pas "professeur", quelle que soit sa définition
-- d'origine.
--
-- On remplace la contrainte (identifiée par son nom exact donné dans
-- le message d'erreur) par la version qui correspond au code de
-- l'application, plutôt que de changer les valeurs utilisées dans
-- toute l'app.
--
-- Idempotente : peut être ré-exécutée sans erreur.

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check check (role in ('eleve', 'professeur'));

-- Preuve visuelle : doit afficher exactement
-- CHECK ((role = ANY (ARRAY['eleve'::text, 'professeur'::text])))
select conname, pg_get_constraintdef(oid) as definition
from pg_constraint
where conrelid = 'public.profiles'::regclass
  and conname = 'profiles_role_check';
