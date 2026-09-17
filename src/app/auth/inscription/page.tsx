import Link from "next/link";
import InscriptionForm from "./InscriptionForm";
import type { Role } from "@/types/database";

export default async function InscriptionPage({
  searchParams,
}: PageProps<"/auth/inscription">) {
  const params = await searchParams;
  const roleParam = Array.isArray(params.role) ? params.role[0] : params.role;
  const defaultRole: Role = roleParam === "professeur" ? "professeur" : "eleve";

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold text-slate-900">Créer un compte</h1>
      <p className="mt-1 text-sm text-slate-500">
        Rejoins EduConnect en quelques secondes.
      </p>

      <div className="mt-8">
        <InscriptionForm defaultRole={defaultRole} />
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">
        Déjà un compte ?{" "}
        <Link href="/auth/connexion" className="font-semibold text-blue-600 hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
