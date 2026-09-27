import { createClient } from "@/lib/supabase/server";

export type NotificationCounts = {
  messages: number;
  rendezVous: number;
  profil: number;
};

export async function getNotificationCounts(
  userId: string,
  role: string | null
): Promise<NotificationCounts> {
  const supabase = await createClient();

  const { data: conversations } = await supabase
    .from("conversations")
    .select("id")
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

  const conversationIds = (conversations ?? []).map(
    (c) => (c as { id: string }).id
  );

  let messages = 0;
  if (conversationIds.length > 0) {
    const { count } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .in("conversation_id", conversationIds)
      .neq("sender_id", userId)
      .eq("read", false);
    messages = count ?? 0;
  }

  const [{ count: profPending }, { count: studentUpdates }] =
    await Promise.all([
      supabase
        .from("appointments")
        .select("id", { count: "exact", head: true })
        .eq("prof_id", userId)
        .eq("prof_seen", false),
      supabase
        .from("appointments")
        .select("id", { count: "exact", head: true })
        .eq("student_id", userId)
        .eq("student_seen", false),
    ]);

  const rendezVous = (profPending ?? 0) + (studentUpdates ?? 0);

  let profil = 0;
  if (role === "professeur") {
    const { count } = await supabase
      .from("ratings")
      .select("id", { count: "exact", head: true })
      .eq("prof_id", userId)
      .eq("prof_seen", false);
    profil = count ?? 0;
  }

  return { messages, rendezVous, profil };
}
