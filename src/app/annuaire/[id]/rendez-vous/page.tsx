import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import RendezVousForm from "./RendezVousForm";
import { normalizeSubjects } from "@/lib/subjects";
import type { Profile } from "@/types/database";

export default async function RendezVousPage({
  params,
}: PageProps<"/annuaire/[id]/rendez-vous">) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/connexion?next=/annuaire/${id}/rendez-vous`);
  }

  const { data: profData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  const prof = profData as Profile | null;

  if (!prof || prof.role !== "professeur") {
    notFound();
  }

  const { data: viewerProfileData } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const viewerProfile = viewerProfileData as Pick<Profile, "role"> | null;

  if (viewerProfile?.role !== "eleve") {
    redirect(`/annuaire/${id}`);
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <Link
        href={`/annuaire/${id}`}
        className="text-sm text-slate-500 hover:text-blue-600"
      >
        ← Retour au profil
      </Link>

      <h1 className="mt-4 text-2xl font-bold text-slate-900">
        Prendre rendez-vous avec {prof.name}
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Propose un créneau, {prof.name} pourra l&apos;accepter ou le refuser.
      </p>

      <div className="mt-8">
        <RendezVousForm profId={id} subjects={normalizeSubjects(prof.subjects)} />
      </div>
    </div>
  );
}
