"use client";

import { useActionState, useState } from "react";
import { rateProfessor, type RateProfessorState } from "./actions";

const initialState: RateProfessorState = { error: null };

export default function RatingForm({
  profId,
  existingStars,
  existingComment,
}: {
  profId: string;
  existingStars: number | null;
  existingComment: string | null;
}) {
  const [state, formAction, pending] = useActionState(
    rateProfessor.bind(null, profId),
    initialState
  );
  const [stars, setStars] = useState(existingStars ?? 0);
  const [hovered, setHovered] = useState(0);

  return (
    <form action={formAction} className="space-y-3">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setStars(value)}
            onMouseEnter={() => setHovered(value)}
            onMouseLeave={() => setHovered(0)}
            className="text-2xl leading-none"
            aria-label={`${value} étoile${value > 1 ? "s" : ""}`}
          >
            {(hovered || stars) >= value ? "⭐" : "☆"}
          </button>
        ))}
        <input type="hidden" name="stars" value={stars} />
      </div>

      <textarea
        name="comment"
        rows={2}
        defaultValue={existingComment ?? ""}
        placeholder="Ton avis (optionnel)"
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
      />

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || stars === 0}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {pending ? "Envoi..." : existingStars ? "Mettre à jour mon avis" : "Publier mon avis"}
      </button>
    </form>
  );
}
