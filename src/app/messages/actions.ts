"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function sendMessage(formData: FormData) {
  const conversationId = formData.get("conversationId") as string;
  const text = (formData.get("text") as string)?.trim();

  if (!conversationId || !text) {
    return;
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/connexion?next=/messages/${conversationId}`);
  }

  await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    text,
  });

  revalidatePath(`/messages/${conversationId}`);
}
