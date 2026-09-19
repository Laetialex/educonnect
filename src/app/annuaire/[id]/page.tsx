import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { startConversation } from "./actions";
import RatingForm from "./RatingForm";
import { normalizeSubjects } from "@/lib/subjects";
import type { Profile, Rating } from "@/types/database";

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

  const p = { ...(profile as Profile), subjects: normalizeSubjects((profile as Profile).subjects) };

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
  const canRate = user && !isSelf && viewerRole === "eleve" && p.role === "professeur";

  let ratings: Rating[] = [];
  let ratingNameById = new Map<string, string>();
  if (p.role === "professeur") {
    const { data: ratingsData } = await supabase
      .from("ratings")
      .select("*")
      .eq("prof_id", p.id)
      .order("created_at", { ascending: false })
      .returns<Rating[]>();
    ratings = ratingsData ?? [];

    const studentIds = Array.from(new Set(ratings.map((r) => r.student_id)));
    if (studentIds.length) {
      const { data: students } = await supabase
        .from("profiles")
        .select("id, name")
        .in("id", studentIds)
        .returns<Pick<Profile, "id" | "name">[]>();
      ratingNameById = new Map((students ?? []).map((s) => [s.id, s.name ?? "Élève"]));
    }
  }

  const averageStars = ratings.length
    ? ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length
    : null;

  const myRating = user
    ? ratings.find((r) => r.student_id === user.id) ?? null
    : null;

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

        {p.role === "professeur" && averageStars !== null && (
          <p className="mt-1 text-sm text-amber-600">
            ⭐ {averageStars.toFixed(1)} / 5{" "}
            <span className="text-slate-400">
              ({ratings.length} avis)
            </span>
          </p>
        )}

        {p.role === "professeur" && p.profession && (
          <p className="mt-2 text-slate-600">{p.profession}</p>
        )}
        {p.level && (
          <p className="mt-2 text-slate-600">
            {p.role === "professeur" ? "Niveau enseigné" : "Niveau"} : {p.level}
          </p>
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

      {p.role === "professeur" && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-bold text-slate-900">Avis des élèves</h2>

          {canRate && (
            <div className="mt-4 border-b border-slate-100 pb-6">
              <RatingForm
                profId={p.id}
                existingStars={myRating?.stars ?? null}
                existingComment={myRating?.comment ?? null}
              />
            </div>
          )}

          {ratings.length === 0 ? (
            <p className="mt-3 text-sm text-slate-400">Aucun avis pour le moment.</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {ratings.map((rating) => (
                <li key={rating.id} className="text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">
                      {ratingNameById.get(rating.student_id) ?? "Élève"}
                    </span>
                    <span className="text-amber-500">
                      {"⭐".repeat(rating.stars)}
                    </span>
                  </div>
                  {rating.comment && (
                    <p className="mt-1 text-slate-600">{rating.comment}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
