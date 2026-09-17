import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { startConversation } from "./actions";
import type { Profile } from "@/types/database";

export default async function ProfilPublicPage({
  params,
}: PageProps<"/annuaire/[id]">) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!profile) {
    notFound();
  }

  const p = profile as Profile;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let viewerRole: string | null = null;
  if (user) {
    const { data: viewerProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    viewerRole = (viewerProfile as { role: string } | null)?.role ?? null;
  }

  const isSelf = user?.id === p.id;
  const canBookAppointment =
    user && !isSelf && viewerRole === "eleve" && p.role === "professeur";

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <Link href="/annuaire" className="text-sm text-slate-500 hover:text-blue-600">
        ← Retour à l&apos;annuaire
      </Link>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">{p.name}</h1>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              p.role === "professeur"
                ? "bg-blue-100 text-blue-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {p.role === "professeur" ? "Professeur" : "Élève"}
          </span>
        </div>

        {p.role === "professeur" && p.profession && (
          <p className="mt-2 text-slate-600">{p.profession}</p>
        )}
        {p.role === "eleve" && p.level && (
          <p className="mt-2 text-slate-600">Niveau : {p.level}</p>
        )}

        {p.subjects && p.subjects.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {p.subjects.map((subject) => (
              <span
                key={subject}
                className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600"
              >
                {subject}
              </span>
            ))}
          </div>
        )}

        {p.role === "eleve" && p.problems && (
          <p className="mt-4 text-sm text-slate-600">
            <span className="font-semibold">Difficultés : </span>
            {p.problems}
          </p>
        )}

        {p.availability && (
          <p className="mt-4 text-sm text-slate-500">
            Disponibilités : {p.availability}
          </p>
        )}

        {!isSelf && (
          <div className="mt-6 flex flex-wrap gap-3">
            <form action={startConversation}>
              <input type="hidden" name="otherUserId" value={p.id} />
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Envoyer un message
              </button>
            </form>

            {canBookAppointment && (
              <Link
                href={`/annuaire/${p.id}/rendez-vous`}
                className="rounded-lg border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
              >
                Prendre rendez-vous
              </Link>
            )}
          </div>
        )}

        {!user && (
          <p className="mt-4 text-xs text-slate-400">
            <Link href={`/auth/connexion?next=/annuaire/${p.id}`} className="underline">
              Connecte-toi
            </Link>{" "}
            pour contacter ce profil.
          </p>
        )}
      </div>
    </div>
  );
}
