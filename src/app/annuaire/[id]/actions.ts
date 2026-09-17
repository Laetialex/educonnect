"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
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

export type RateProfessorState = {
  error: string | null;
};

export async function rateProfessor(
  profId: string,
  _prevState: RateProfessorState,
  formData: FormData
): Promise<RateProfessorState> {
  if (!UUID_RE.test(profId)) {
    redirect("/annuaire");
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/connexion?next=/annuaire/${profId}`);
  }

  if (user.id === profId) {
    return { error: "Tu ne peux pas te noter toi-même." };
  }

  const stars = Number(formData.get("stars"));
  const comment = (formData.get("comment") as string)?.trim() || null;

  if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
    return { error: "Choisis une note entre 1 et 5 étoiles." };
  }

  const { data: existing } = await supabase
    .from("ratings")
    .select("id")
    .eq("prof_id", profId)
    .eq("student_id", user.id)
    .maybeSingle();

  const { error } = existing
    ? await supabase
        .from("ratings")
        .update({ stars, comment })
        .eq("id", (existing as { id: string }).id)
    : await supabase
        .from("ratings")
        .insert({ prof_id: profId, student_id: user.id, stars, comment });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/annuaire/${profId}`);
  return { error: null };
}
