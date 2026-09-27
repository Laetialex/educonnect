-- RLS pour appointments et ratings (jamais configurées jusqu'ici, comme
-- conversations/messages avant leur propre migration) + colonnes de suivi
-- "vu / pas vu" pour les pastilles de notification du menu, + policy
-- update manquante sur messages (nécessaire pour marquer un message lu).
--
-- Idempotente : peut être ré-exécutée sans erreur.

-- 1) Colonnes de suivi "vu" ---------------------------------------------
-- Défaut à true : les lignes déjà existantes ne déclenchent pas de
-- pastille rétroactive. Le code applicatif repasse explicitement ces
-- colonnes à false au moment où un événement doit notifier l'autre
-- personne (nouvelle demande, réponse, nouveau message, nouvel avis).

alter table public.appointments
  add column if not exists prof_seen boolean not null default true;

alter table public.appointments
  add column if not exists student_seen boolean not null default true;

alter table public.ratings
  add column if not exists prof_seen boolean not null default true;

alter table public.messages
  add column if not exists read boolean not null default true;

-- 2) RLS appointments -----------------------------------------------------

do $$
declare
  pol record;
begin
  for pol in
    select policyname
    from pg_policies
    where schemaname = 'public' and tablename = 'appointments'
  loop
    execute format('drop policy if exists %I on public.appointments', pol.policyname);
  end loop;
end $$;

alter table public.appointments enable row level security;

create policy "appointments_select_participant"
on public.appointments
for select
to authenticated
using (auth.uid() = student_id or auth.uid() = prof_id);

create policy "appointments_insert_student"
on public.appointments
for insert
to authenticated
with check (auth.uid() = student_id);

create policy "appointments_update_participant"
on public.appointments
for update
to authenticated
using (auth.uid() = student_id or auth.uid() = prof_id)
with check (auth.uid() = student_id or auth.uid() = prof_id);

-- 3) RLS ratings ------------------------------------------------------------

do $$
declare
  pol record;
begin
  for pol in
    select policyname
    from pg_policies
    where schemaname = 'public' and tablename = 'ratings'
  loop
    execute format('drop policy if exists %I on public.ratings', pol.policyname);
  end loop;
end $$;

alter table public.ratings enable row level security;

-- Les avis sont publics (affichés sur le profil d'un prof, même pour un
-- visiteur non connecté) : lecture ouverte à tous.
create policy "ratings_select_all"
on public.ratings
for select
to anon, authenticated
using (true);

create policy "ratings_insert_student"
on public.ratings
for insert
to authenticated
with check (auth.uid() = student_id);

create policy "ratings_update_own"
on public.ratings
for update
to authenticated
using (auth.uid() = student_id)
with check (auth.uid() = student_id);

-- 4) Policy update manquante sur messages -----------------------------------
-- Nécessaire pour que l'un des deux participants puisse marquer les
-- messages de la conversation comme lus (read = true).

drop policy if exists "messages_update_participant" on public.messages;

create policy "messages_update_participant"
on public.messages
for update
to authenticated
using (
  exists (
    select 1 from public.conversations c
    where c.id = messages.conversation_id
      and (c.user1_id = auth.uid() or c.user2_id = auth.uid())
  )
)
with check (
  exists (
    select 1 from public.conversations c
    where c.id = messages.conversation_id
      and (c.user1_id = auth.uid() or c.user2_id = auth.uid())
  )
);

-- Preuve visuelle : doit afficher les policies de appointments (3),
-- ratings (3) et messages (3, avec la nouvelle update en plus des 2
-- existantes) — 9 lignes au total.
select tablename, policyname, cmd, roles
from pg_policies
where schemaname = 'public' and tablename in ('appointments', 'ratings', 'messages')
order by tablename, policyname;
