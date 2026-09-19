"use client";

import { useActionState, useState } from "react";
import { upsertProfile, type UpsertProfileState } from "./actions";
import type { Profile, Role } from "@/types/database";

const initialState: UpsertProfileState = { error: null };

const NIVEAUX_ENSEIGNES = ["Collège", "Lycée", "Université"] as const;

export default function ProfilForm({
  profile,
  defaultRole,
}: {
  profile: Profile | null;
  defaultRole: Role;
}) {
  const [state, formAction, pending] = useActionState(
    upsertProfile,
    initialState
  );
  const [role, setRole] = useState<Role>(profile?.role ?? defaultRole);
  const [niveauxEnseignes, setNiveauxEnseignes] = useState<string[]>(() =>
    profile?.role === "professeur" && profile.level
      ? profile.level.split(",").map((s) => s.trim()).filter(Boolean)
      : []
  );

  function toggleNiveauEnseigne(niveau: string) {
    setNiveauxEnseignes((prev) =>
      prev.includes(niveau)
        ? prev.filter((n) => n !== niveau)
        : [...prev, niveau]
    );
  }

  return (
    <form action={formAction} className="space-y-5">
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
        <input type="hidden" name="role" value={role} />
      </div>

      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
          Nom complet
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={profile?.name ?? ""}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          placeholder="Ex : Sofia Martin"
        />
      </div>

      {role === "eleve" ? (
        <div>
          <label htmlFor="level" className="mb-1 block text-sm font-medium text-slate-700">
            Niveau scolaire
          </label>
          <input
            id="level"
            name="level"
            required
            defaultValue={profile?.level ?? ""}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            placeholder="Ex : Seconde, Terminale, Licence 1..."
          />
        </div>
      ) : (
        <>
          <div>
            <label htmlFor="profession" className="mb-1 block text-sm font-medium text-slate-700">
              Profession / diplôme
            </label>
            <input
              id="profession"
              name="profession"
              defaultValue={profile?.profession ?? ""}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              placeholder="Ex : Professeure de mathématiques certifiée"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Niveau enseigné
            </label>
            <div className="grid grid-cols-3 gap-3">
              {NIVEAUX_ENSEIGNES.map((niveau) => (
                <button
                  key={niveau}
                  type="button"
                  onClick={() => toggleNiveauEnseigne(niveau)}
                  className={`rounded-lg border px-4 py-2 text-sm font-semibold ${
                    niveauxEnseignes.includes(niveau)
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-slate-200 text-slate-600"
                  }`}
                >
                  {niveau}
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Sélectionne un ou plusieurs niveaux.
            </p>
            <input type="hidden" name="level" value={niveauxEnseignes.join(", ")} />
          </div>
        </>
      )}

      <div>
        <label htmlFor="subjects" className="mb-1 block text-sm font-medium text-slate-700">
          {role === "eleve" ? "Matières à travailler" : "Matières enseignées"}
        </label>
        <input
          id="subjects"
          name="subjects"
          defaultValue={profile?.subjects?.join(", ") ?? ""}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          placeholder="Ex : Mathématiques, Physique-Chimie"
        />
        <p className="mt-1 text-xs text-slate-400">Sépare les matières par une virgule.</p>
      </div>

      {role === "eleve" && (
        <div>
          <label htmlFor="problems" className="mb-1 block text-sm font-medium text-slate-700">
            Difficultés rencontrées
          </label>
          <textarea
            id="problems"
            name="problems"
            rows={3}
            defaultValue={profile?.problems ?? ""}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            placeholder="Décris ce sur quoi tu as besoin d'aide"
          />
        </div>
      )}

      <div>
        <label htmlFor="availability" className="mb-1 block text-sm font-medium text-slate-700">
          Disponibilités
        </label>
        <input
          id="availability"
          name="availability"
          defaultValue={profile?.availability ?? ""}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          placeholder="Ex : Lundi et mercredi soir, week-end"
        />
      </div>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
      >
        {pending ? "Enregistrement..." : "Enregistrer mon dossier"}
      </button>
    </form>
  );
}
