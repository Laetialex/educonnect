"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function startConversation(formData: FormData) {
  const otherUserId = formData.get("otherUserId") as string;

  if (!otherUserId || !UUID_RE.test(otherUserId)) {
    redirect("/annuaire");
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/connexion?next=/annuaire/${otherUserId}`);
  }

  if (user.id === otherUserId) {
    redirect(`/annuaire/${otherUserId}`);
  }

  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .or(
      `and(user1_id.eq.${user.id},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${user.id})`
    )
    .maybeSingle();

  if (existing) {
    redirect(`/messages/${existing.id}`);
  }

  const { data: created, error } = await supabase
    .from("conversations")
    .insert({ user1_id: user.id, user2_id: otherUserId })
    .select("id")
    .single();

  if (error || !created) {
    redirect(`/annuaire/${otherUserId}?erreur=conversation`);
  }

  redirect(`/messages/${created.id}`);
}
