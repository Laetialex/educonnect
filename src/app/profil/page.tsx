import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfilForm from "./ProfilForm";
import { normalizeSubjects } from "@/lib/subjects";
import type { Profile, Role } from "@/types/database";

export default async function ProfilPage({
  searchParams,
}: PageProps<"/profil">) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/connexion?next=/profil");
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const profile = profileData
    ? {
        ...(profileData as Profile),
        subjects: normalizeSubjects((profileData as Profile).subjects),
      }
    : null;

  const params = await searchParams;
  const roleParam = Array.isArray(params.role) ? params.role[0] : params.role;
  const defaultRole: Role = roleParam === "professeur" ? "professeur" : "eleve";
  const saved = params.enregistre === "1";

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <h1 className="text-2xl font-bold text-slate-900">Mon dossier</h1>
      <p className="mt-1 text-sm text-slate-500">
        Complète ton profil pour apparaître dans l&apos;annuaire EduConnect.
      </p>

      {saved && (
        <p className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          Ton dossier a bien été enregistré ✅
        </p>
      )}

      <div className="mt-8">
        <ProfilForm profile={profile} defaultRole={defaultRole} />
      </div>
    </div>
  );
}
