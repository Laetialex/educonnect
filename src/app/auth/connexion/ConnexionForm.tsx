"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ConnexionForm({ next }: { next: string }) {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<"connexion" | "mot-de-passe-oublie">(
    "connexion"
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError("Email ou mot de passe incorrect.");
      return;
    }

    router.push(next);
    router.refresh();
  }

  async function handleResetSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResetError(null);
    setResetLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/auth/reinitialiser-mot-de-passe`,
    });

    setResetLoading(false);

    if (error) {
      setResetError(error.message);
      return;
    }

    setResetSent(true);
  }

  if (mode === "mot-de-passe-oublie") {
    if (resetSent) {
      return (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-6 text-center text-blue-800">
          <p className="font-semibold">Vérifie ta boîte mail 📬</p>
          <p className="mt-2 text-sm">
            Si un compte existe avec l&apos;adresse <b>{resetEmail}</b>, un lien
            pour réinitialiser ton mot de passe vient de t&apos;être envoyé.
          </p>
          <button
            type="button"
            onClick={() => {
              setMode("connexion");
              setResetSent(false);
            }}
            className="mt-4 text-sm font-semibold text-blue-700 underline"
          >
            Retour à la connexion
          </button>
        </div>
      );
    }

    return (
      <form onSubmit={handleResetSubmit} className="space-y-4">
        <p className="text-sm text-slate-500">
          Saisis ton email, on t&apos;envoie un lien pour créer un nouveau mot
          de passe.
        </p>

        <div>
          <label
            htmlFor="reset-email"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Email
          </label>
          <input
            id="reset-email"
            type="email"
            required
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            placeholder="toi@exemple.fr"
          />
        </div>

        {resetError && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {resetError}
          </p>
        )}

        <button
          type="submit"
          disabled={resetLoading}
          className="w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
        >
          {resetLoading ? "Envoi..." : "Envoyer le lien de réinitialisation"}
        </button>

        <button
          type="button"
          onClick={() => setMode("connexion")}
          className="w-full text-center text-sm text-slate-500 hover:text-blue-600"
        >
          ← Retour à la connexion
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
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
        {loading ? "Connexion..." : "Se connecter"}
      </button>

      <button
        type="button"
        onClick={() => setMode("mot-de-passe-oublie")}
        className="w-full text-center text-sm text-slate-500 hover:text-blue-600"
      >
        Mot de passe oublié ?
      </button>
    </form>
  );
}
