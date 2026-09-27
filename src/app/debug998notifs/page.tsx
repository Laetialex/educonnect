import { createClient } from "@/lib/supabase/server";
import { getNotificationCounts } from "@/lib/notifications";

export default async function Debug998NotifsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-lg">
        Tu n&apos;es pas connecté. Connecte-toi d&apos;abord, puis reviens sur
        cette page.
      </div>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const role = (profile as { role: string } | null)?.role ?? "aucun profil";
  const name = (profile as { name: string } | null)?.name ?? "(sans nom)";

  const counts = await getNotificationCounts(user.id, role);

  const { data: conversations } = await supabase
    .from("conversations")
    .select("*")
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

  const conversationIds = (conversations ?? []).map(
    (c) => (c as { id: string }).id
  );

  const otherIds = (conversations ?? []).map((c) => {
    const conv = c as { user1_id: string; user2_id: string };
    return conv.user1_id === user.id ? conv.user2_id : conv.user1_id;
  });

  const { data: otherProfiles } = otherIds.length
    ? await supabase.from("profiles").select("id, name").in("id", otherIds)
    : { data: [] };

  const otherNameById = new Map(
    (otherProfiles ?? []).map((p) => [
      (p as { id: string }).id,
      (p as { name: string | null }).name,
    ])
  );

  const { data: messages } = conversationIds.length
    ? await supabase
        .from("messages")
        .select("*")
        .in("conversation_id", conversationIds)
        .order("created_at", { ascending: false })
        .limit(15)
    : { data: [] };

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-lg leading-relaxed">
      <p>
        Tu es connecté en tant que : <strong>{name}</strong> (
        {user.email}) — rôle : <strong>{role}</strong>
      </p>

      <p className="mt-4 text-2xl">
        Pastille &quot;Messagerie&quot; :{" "}
        <strong className={counts.messages > 0 ? "text-red-600" : "text-slate-500"}>
          {counts.messages}
        </strong>
      </p>

      <h2 className="mt-8 font-bold">Tu discutes avec :</h2>
      <ul className="mt-2 space-y-1 text-sm">
        {(conversations ?? []).length === 0 && <li>Aucune conversation.</li>}
        {(conversations ?? []).map((c) => {
          const conv = c as { id: string; user1_id: string; user2_id: string };
          const otherId =
            conv.user1_id === user.id ? conv.user2_id : conv.user1_id;
          return (
            <li key={conv.id}>
              <strong>{otherNameById.get(otherId) ?? "(sans nom)"}</strong> —
              identifiant : <code>{otherId}</code>
            </li>
          );
        })}
      </ul>

      <h2 className="mt-8 font-bold">Tes 15 derniers messages (tous, envoyés et reçus) :</h2>
      <ul className="mt-2 space-y-2 text-sm">
        {(messages ?? []).length === 0 && <li>Aucun message.</li>}
        {(messages ?? []).map((m) => {
          const msg = m as {
            id: string;
            sender_id: string;
            text: string;
            read: boolean;
          };
          const sentByMe = msg.sender_id === user.id;
          return (
            <li key={msg.id} className="rounded-lg border border-slate-200 p-2">
              {sentByMe ? "Envoyé par moi" : "Reçu"} — &quot;{msg.text}&quot; —{" "}
              {sentByMe ? (
                <span className="text-slate-400">(peu importe pour moi)</span>
              ) : msg.read ? (
                <span className="text-green-600">déjà lu</span>
              ) : (
                <span className="font-bold text-red-600">PAS ENCORE LU</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
