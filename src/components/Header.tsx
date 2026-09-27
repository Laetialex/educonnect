import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getNotificationCounts } from "@/lib/notifications";

function Pastille({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white">
      {count > 9 ? "9+" : count}
    </span>
  );
}

export default async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let counts = { messages: 0, rendezVous: 0, profil: 0 };
  if (user) {
    const { data: viewerProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    counts = await getNotificationCounts(
      user.id,
      (viewerProfile as { role: string } | null)?.role ?? null
    );
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-bold text-slate-900">
          Edu<span className="text-blue-600">Connect</span>
        </Link>

        <nav className="flex items-center gap-4 text-sm font-medium text-slate-600">
          <Link href="/annuaire" className="hover:text-blue-600">
            Annuaire
          </Link>

          {user ? (
            <>
              <Link href="/messages" className="flex items-center hover:text-blue-600">
                Messagerie
                <Pastille count={counts.messages} />
              </Link>
              <Link href="/rendez-vous" className="flex items-center hover:text-blue-600">
                Rendez-vous
                <Pastille count={counts.rendezVous} />
              </Link>
              <Link href="/profil" className="flex items-center hover:text-blue-600">
                Mon profil
                <Pastille count={counts.profil} />
              </Link>
              <form action="/auth/deconnexion" method="post">
                <button
                  type="submit"
                  className="rounded-lg bg-slate-100 px-3 py-1.5 text-slate-700 hover:bg-slate-200"
                >
                  Déconnexion
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/auth/connexion" className="hover:text-blue-600">
                Connexion
              </Link>
              <Link
                href="/auth/inscription"
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-white hover:bg-blue-700"
              >
                Inscription
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
