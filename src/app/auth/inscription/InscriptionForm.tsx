"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Role } from "@/types/database";

export default function InscriptionForm({
  defaultRole,
}: {
  defaultRole: Role;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [role, setRole] = useState<Role>(defaultRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role },
        emailRedirectTo: `${window.location.origin}/profil`,
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    if (data.session) {
      // Confirmation email désactivée côté Supabase : on a déjà une session.
      router.push(`/profil?role=${role}`);
      router.refresh();
    } else {
      // Confirmation email activée : il faut cliquer sur le lien reçu par mail.
      setCheckEmail(true);
    }
  }

  if (checkEmail) {
    return (
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-6 text-center text-blue-800">
        <p className="font-semibold">Vérifie ta boîte mail 📬</p>
        <p className="mt-2 text-sm">
          Nous avons envoyé un lien de confirmation à <b>{email}</b>. Clique
          dessus pour activer ton compte.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Je suis...
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRole("eleve")}
            className={`rounded-lg border px-4 py-2 text-sm font-semibold ${
              role === "eleve"
                ? "border-blue-600 bg-blue-50 text-blue-700"
                : "border-slate-200 text-slate-600"
            }`}
          >
            🎓 Élève
          </button>
          <button
            type="button"
            onClick={() => setRole("professeur")}
            className={`rounded-lg border px-4 py-2 text-sm font-semibold ${
              role === "professeur"
                ? "border-blue-600 bg-blue-50 text-blue-700"
                : "border-slate-200 text-slate-600"
            }`}
          >
            🧑‍🏫 Professeur
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          placeholder="toi@exemple.fr"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
          Mot de passe
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          placeholder="6 caractères minimum"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
      >
        {loading ? "Création du compte..." : "Créer mon compte"}
      </button>
    </form>
  );
}
