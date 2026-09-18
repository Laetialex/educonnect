import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import NouveauMotDePasseForm from "./NouveauMotDePasseForm";

export default async function ReinitialiserMotDePassePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold text-slate-900">
        Nouveau mot de passe
      </h1>

      {user ? (
        <>
          <p className="mt-1 text-sm text-slate-500">
            Choisis un nouveau mot de passe pour ton compte.
          </p>
          <div className="mt-8">
            <NouveauMotDePasseForm />
          </div>
        </>
      ) : (
        <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          <p className="font-semibold">Lien invalide ou expiré.</p>
          <p className="mt-1">
            Redemande un lien de réinitialisation depuis la page{" "}
            <Link href="/auth/connexion" className="underline">
              connexion
            </Link>
            .
          </p>
        </div>
      )}
    </div>
  );
}
