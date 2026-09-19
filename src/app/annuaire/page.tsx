import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { normalizeSubjects } from "@/lib/subjects";
import type { Profile } from "@/types/database";

export default async function AnnuairePage({
  searchParams,
}: PageProps<"/annuaire">) {
  const supabase = await createClient();

  const { data: profilesData, error } = await supabase
    .from("profiles")
    .select("*")
    .order("name", { ascending: true })
    .returns<Profile[]>();

  const profiles = profilesData?.map((p) => ({
    ...p,
    subjects: normalizeSubjects(p.subjects),
  }));

  const params = await searchParams;
  const justSaved = params.enregistre === "1";

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="text-2xl font-bold text-slate-900">Annuaire</h1>
      <p className="mt-1 text-sm text-slate-500">
        Retrouve tous les élèves et professeurs inscrits sur EduConnect.
      </p>

      {justSaved && (
        <p className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          Ton dossier a bien été enregistré ✅
        </p>
      )}

      {error && (
        <p className="mt-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          Impossible de charger l&apos;annuaire : {error.message}
        </p>
      )}

      {!error && (!profiles || profiles.length === 0) && (
        <p className="mt-10 text-center text-slate-500">
          Aucun profil pour le moment. Sois le premier à t&apos;inscrire !
        </p>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {profiles?.map((profile) => (
          <Link
            key={profile.id}
            href={`/annuaire/${profile.id}`}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-400 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-900">
                {profile.name ?? "Utilisateur"}
              </h2>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  profile.role === "professeur"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {profile.role === "professeur" ? "Professeur" : "Élève"}
              </span>
            </div>

            {profile.role === "professeur" && profile.profession && (
              <p className="mt-2 text-sm text-slate-600">{profile.profession}</p>
            )}

            {profile.level && (
              <p className="mt-2 text-sm text-slate-600">
                {profile.role === "professeur" ? "Niveau enseigné" : "Niveau"} :{" "}
                {profile.level}
              </p>
            )}

            {profile.subjects && profile.subjects.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {profile.subjects.map((subject) => (
                  <span
                    key={subject}
                    className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600"
                  >
                    {subject}
                  </span>
                ))}
              </div>
            )}

            {profile.availability && (
              <p className="mt-3 text-xs text-slate-400">
                Dispo : {profile.availability}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
