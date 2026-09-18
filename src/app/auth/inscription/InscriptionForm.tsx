"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { OTP_LENGTH } from "@/lib/auth";
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
  const [awaitingCode, setAwaitingCode] = useState(false);

  const [code, setCode] = useState("");
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role },
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
      // Confirmation par code activée : il faut saisir le code reçu par mail.
      setAwaitingCode(true);
    }
  }

  async function handleCodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCodeError(null);
    setCodeLoading(true);

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "signup",
    });

    setCodeLoading(false);

    if (error) {
      setCodeError("Code invalide ou expiré.");
      return;
    }

    router.push(`/profil?role=${role}`);
    router.refresh();
  }

  async function handleResend() {
    setCodeError(null);
    setResent(false);
    const { error } = await supabase.auth.resend({ type: "signup", email });
    if (error) {
      setCodeError(error.message);
      return;
    }
    setResent(true);
  }

  if (awaitingCode) {
    return (
      <form onSubmit={handleCodeSubmit} className="space-y-4">
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
          <p className="font-semibold">Vérifie ta boîte mail 📬</p>
          <p className="mt-1">
            Nous avons envoyé un code à {OTP_LENGTH} chiffres à <b>{email}</b>.
            Saisis-le ci-dessous pour activer ton compte.
          </p>
        </div>

        <div>
          <label htmlFor="code" className="mb-1 block text-sm font-medium text-slate-700">
            Code de confirmation
          </label>
          <input
            id="code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={OTP_LENGTH}
            required
            autoFocus
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-center text-lg tracking-[0.35em] focus:border-blue-500 focus:outline-none"
            placeholder={"0".repeat(OTP_LENGTH)}
          />
        </div>

        {codeError && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {codeError}
          </p>
        )}

        {resent && (
          <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
            Un nouveau code vient d&apos;être envoyé.
          </p>
        )}

        <button
          type="submit"
          disabled={codeLoading || code.length !== OTP_LENGTH}
          className="w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
        >
          {codeLoading ? "Vérification..." : "Confirmer mon compte"}
        </button>

        <button
          type="button"
          onClick={handleResend}
          className="w-full text-center text-sm text-slate-500 hover:text-blue-600"
        >
          Renvoyer le code
        </button>
      </form>
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
