import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-20 text-center">
      <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
        Bienvenue sur <span className="text-blue-600">EduConnect</span>
      </h1>
      <p className="mt-4 max-w-xl text-lg text-slate-600">
        La plateforme qui met en relation élèves et professeurs particuliers
        pour progresser ensemble.
      </p>

      <div className="mt-10 grid w-full gap-4 sm:grid-cols-2">
        <Link
          href="/auth/inscription?role=eleve"
          className="group rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:border-blue-500 hover:shadow-md"
        >
          <div className="text-4xl">🎓</div>
          <h2 className="mt-4 text-xl font-bold text-slate-900">
            Je suis élève
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Trouve un professeur qui peut t&apos;aider dans la matière de ton
            choix.
          </p>
          <span className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white group-hover:bg-blue-700">
            C&apos;est parti
          </span>
        </Link>

        <Link
          href="/auth/inscription?role=professeur"
          className="group rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:border-blue-500 hover:shadow-md"
        >
          <div className="text-4xl">🧑‍🏫</div>
          <h2 className="mt-4 text-xl font-bold text-slate-900">
            Je suis professeur
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Propose tes cours et aide des élèves à progresser dans tes
            matières.
          </p>
          <span className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white group-hover:bg-blue-700">
            C&apos;est parti
          </span>
        </Link>
      </div>

      <Link
        href="/annuaire"
        className="mt-10 text-sm font-medium text-slate-500 underline-offset-4 hover:text-blue-600 hover:underline"
      >
        Ou consulter l&apos;annuaire sans créer de compte →
      </Link>
    </div>
  );
}
