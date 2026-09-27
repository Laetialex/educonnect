import { createClient } from "@/lib/supabase/server";
import { getNotificationCounts } from "@/lib/notifications";

export default async function Debug998NotifsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <pre>Pas connecté.</pre>;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const counts = await getNotificationCounts(
    user.id,
    (profile as { role: string } | null)?.role ?? null
  );

  const { data: conversations } = await supabase
    .from("conversations")
    .select("*")
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

  const conversationIds = (conversations ?? []).map(
    (c) => (c as { id: string }).id
  );

  const { data: messages } = conversationIds.length
    ? await supabase
        .from("messages")
        .select("*")
        .in("conversation_id", conversationIds)
        .order("created_at", { ascending: false })
        .limit(10)
    : { data: [] };

  const { data: appointments } = await supabase
    .from("appointments")
    .select("*")
    .or(`student_id.eq.${user.id},prof_id.eq.${user.id}`)
    .order("created_at", { ascending: false })
    .limit(10);

  const data = {
    userId: user.id,
    profileRole: (profile as { role: string } | null)?.role ?? null,
    counts,
    conversations,
    messages,
    appointments,
  };

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
