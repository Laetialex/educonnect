"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { OTP_LENGTH } from "@/lib/auth";

export default function ReinitialiserMotDePasseForm() {
  const supabase = createClient();

  const [step, setStep] = useState<"email" | "code" | "succes">("email");

  const [email, setEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEmailError(null);
    setEmailLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    setEmailLoading(false);

    if (error) {
      setEmailError(error.message);
      return;
    }

    setStep("code");
  }

  async function handleCodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCodeError(null);

    if (newPassword.length < 6) {
      setCodeError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setCodeError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setCodeLoading(true);

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "recovery",
    });

    if (verifyError) {
      setCodeLoading(false);
      setCodeError("Code invalide ou expiré.");
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setCodeLoading(false);

    if (updateError) {
      setCodeError(updateError.message);
      return;
    }

    setStep("succes");
  }

  async function handleResend() {
    setCodeError(null);
    setResent(false);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      setCodeError(error.message);
      return;
    }
    setResent(true);
  }

  if (step === "succes") {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center text-green-800">
        <p className="font-semibold">Mot de passe mis à jour ✅</p>
        <p className="mt-2 text-sm">
          Ton nouveau mot de passe est actif. Tu peux continuer sur
          EduConnect.
        </p>
        <Link
          href="/profil"
          className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Aller à mon profil
        </Link>
      </div>
    );
  }

  if (step === "code") {
    return (
      <form onSubmit={handleCodeSubmit} className="space-y-4">
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
          <p className="font-semibold">Vérifie ta boîte mail 📬</p>
          <p className="mt-1">
            Si un compte existe avec l&apos;adresse <b>{email}</b>, un code à{" "}
            {OTP_LENGTH} chiffres vient de t&apos;être envoyé.
          </p>
        </div>

        <div>
          <label htmlFor="code" className="mb-1 block text-sm font-medium text-slate-700">
            Code reçu par email
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

        <div>
          <label htmlFor="newPassword" className="mb-1 block text-sm font-medium text-slate-700">
            Nouveau mot de passe
          </label>
          <input
            id="newPassword"
            type="password"
            required
            minLength={6}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            placeholder="6 caractères minimum"
          />
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Confirme le mot de passe
          </label>
          <input
            id="confirmPassword"
            type="password"
            required
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
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
          {codeLoading ? "Validation..." : "Valider et changer le mot de passe"}
        </button>

        <div className="flex justify-between text-sm">
          <button
            type="button"
            onClick={() => setStep("email")}
            className="text-slate-500 hover:text-blue-600"
          >
            ← Changer d&apos;email
          </button>
          <button
            type="button"
            onClick={handleResend}
            className="text-slate-500 hover:text-blue-600"
          >
            Renvoyer le code
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleEmailSubmit} className="space-y-4">
      <p className="text-sm text-slate-500">
        Saisis ton email, on t&apos;envoie un code à {OTP_LENGTH} chiffres
        pour créer un nouveau mot de passe.
      </p>

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

      {emailError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {emailError}
        </p>
      )}

      <button
        type="submit"
        disabled={emailLoading}
        className="w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
      >
        {emailLoading ? "Envoi..." : "Envoyer le code"}
      </button>

      <Link
        href="/auth/connexion"
        className="block text-center text-sm text-slate-500 hover:text-blue-600"
      >
        ← Retour à la connexion
      </Link>
    </form>
  );
}
