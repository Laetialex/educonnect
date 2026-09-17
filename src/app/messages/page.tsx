import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Conversation, Profile } from "@/types/database";

export default async function MessagesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/connexion?next=/messages");
  }

  const { data: conversations } = await supabase
    .from("conversations")
    .select("*")
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
    .returns<Conversation[]>();

  const otherUserIds = Array.from(
    new Set(
      (conversations ?? []).map((c) =>
        c.user1_id === user.id ? c.user2_id : c.user1_id
      )
    )
  );

  const { data: otherProfiles } = otherUserIds.length
    ? await supabase
        .from("profiles")
        .select("id, name, role")
        .in("id", otherUserIds)
        .returns<Pick<Profile, "id" | "name" | "role">[]>()
    : { data: [] as Pick<Profile, "id" | "name" | "role">[] };

  const profileById = new Map((otherProfiles ?? []).map((p) => [p.id, p]));

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-2xl font-bold text-slate-900">Messagerie</h1>
      <p className="mt-1 text-sm text-slate-500">Tes conversations avec les autres membres.</p>

      {(!conversations || conversations.length === 0) && (
        <p className="mt-10 text-center text-slate-500">
          Aucune conversation pour l&apos;instant.{" "}
          <Link href="/annuaire" className="text-blue-600 underline">
            Va voir l&apos;annuaire
          </Link>{" "}
          pour contacter quelqu&apos;un.
        </p>
      )}

      <div className="mt-8 flex flex-col gap-2">
        {conversations?.map((conversation) => {
          const otherId =
            conversation.user1_id === user.id
              ? conversation.user2_id
              : conversation.user1_id;
          const otherProfile = profileById.get(otherId);

          return (
            <Link
              key={conversation.id}
              href={`/messages/${conversation.id}`}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:border-blue-400"
            >
              <span className="font-semibold text-slate-900">
                {otherProfile?.name ?? "Utilisateur"}
              </span>
              {otherProfile?.role && (
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    otherProfile.role === "professeur"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {otherProfile.role === "professeur" ? "Professeur" : "Élève"}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
