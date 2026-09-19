-- Policies RLS pour conversations et messages — jamais configurées
-- jusqu'ici (seule profiles avait été corrigée). Conséquence : cliquer
-- sur "Envoyer un message" ne faisait rien de visible, car l'insertion
-- dans conversations échouait silencieusement contre la policy RLS
-- par défaut (aucune policy = tout refusé), et la page de profil
-- n'affichait de toute façon pas l'erreur renvoyée (corrigé côté code
-- séparément).
--
-- Contrairement à profiles, ces tables ne doivent PAS être lisibles
-- publiquement : seuls les deux participants d'une conversation
-- peuvent la voir et y écrire.
--
-- Idempotente : peut être ré-exécutée sans erreur.

do $$
declare
  pol record;
begin
  for pol in
    select policyname
    from pg_policies
    where schemaname = 'public' and tablename = 'conversations'
  loop
    execute format('drop policy if exists %I on public.conversations', pol.policyname);
  end loop;

  for pol in
    select policyname
    from pg_policies
    where schemaname = 'public' and tablename = 'messages'
  loop
    execute format('drop policy if exists %I on public.messages', pol.policyname);
  end loop;
end $$;

alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- conversations : un utilisateur authentifié ne voit/crée que les
-- conversations où il est l'un des deux participants.
create policy "conversations_select_participant"
on public.conversations
for select
to authenticated
using (auth.uid() = user1_id or auth.uid() = user2_id);

create policy "conversations_insert_participant"
on public.conversations
for insert
to authenticated
with check (auth.uid() = user1_id or auth.uid() = user2_id);

-- messages : un utilisateur authentifié ne voit/envoie que des
-- messages appartenant à une conversation dont il est participant, et
-- ne peut envoyer un message qu'en son propre nom (sender_id =
-- auth.uid()).
create policy "messages_select_participant"
on public.messages
for select
to authenticated
using (
  exists (
    select 1 from public.conversations c
    where c.id = messages.conversation_id
      and (c.user1_id = auth.uid() or c.user2_id = auth.uid())
  )
);

create policy "messages_insert_participant"
on public.messages
for insert
to authenticated
with check (
  sender_id = auth.uid()
  and exists (
    select 1 from public.conversations c
    where c.id = messages.conversation_id
      and (c.user1_id = auth.uid() or c.user2_id = auth.uid())
  )
);

-- Preuve visuelle : doit afficher 2 lignes pour conversations et
-- 2 lignes pour messages (4 au total).
select tablename, policyname, cmd, roles
from pg_policies
where schemaname = 'public' and tablename in ('conversations', 'messages')
order by tablename, policyname;
