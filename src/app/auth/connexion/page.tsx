import Link from "next/link";
import ConnexionForm from "./ConnexionForm";

export default async function ConnexionPage({
  searchParams,
}: PageProps<"/auth/connexion">) {
  const params = await searchParams;
  const nextParam = Array.isArray(params.next) ? params.next[0] : params.next;
  const errorParam = Array.isArray(params.error) ? params.error[0] : params.error;

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold text-slate-900">Connexion</h1>
      <p className="mt-1 text-sm text-slate-500">
        Content de te revoir sur EduConnect.
      </p>

      {errorParam === "lien_invalide" && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          Ce lien de confirmation n&apos;est plus valide. Réessaie de te connecter.
        </p>
      )}

      <div className="mt-8">
        <ConnexionForm next={nextParam ?? "/profil"} />
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">
        Pas encore de compte ?{" "}
        <Link href="/auth/inscription" className="font-semibold text-blue-600 hover:underline">
          S&apos;inscrire
        </Link>
      </p>
    </div>
  );
}
