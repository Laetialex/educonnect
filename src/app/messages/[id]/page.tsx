import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MessageThread from "./MessageThread";
import type { Conversation, Message, Profile } from "@/types/database";

export default async function ConversationPage({
  params,
}: PageProps<"/messages/[id]">) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/connexion?next=/messages/${id}`);
  }

  const { data: conversationData } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  const conversation = conversationData as Conversation | null;

  if (!conversation) {
    notFound();
  }

  if (conversation.user1_id !== user.id && conversation.user2_id !== user.id) {
    notFound();
  }

  const otherUserId =
    conversation.user1_id === user.id
      ? conversation.user2_id
      : conversation.user1_id;

  const { data: otherProfileData } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", otherUserId)
    .maybeSingle();
  const otherProfile = otherProfileData as Pick<Profile, "name"> | null;

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true })
    .returns<Message[]>();

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <Link href="/messages" className="text-sm text-slate-500 hover:text-blue-600">
        ← Toutes les conversations
      </Link>

      <div className="mt-4">
        <MessageThread
          conversationId={id}
          currentUserId={user.id}
          otherUserName={otherProfile?.name ?? "Utilisateur"}
          initialMessages={messages ?? []}
        />
      </div>
    </div>
  );
}
