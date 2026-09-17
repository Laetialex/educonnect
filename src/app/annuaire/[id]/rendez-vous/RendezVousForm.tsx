"use client";

import { useActionState } from "react";
import { createAppointment, type CreateAppointmentState } from "./actions";

const initialState: CreateAppointmentState = { error: null };

export default function RendezVousForm({
  profId,
  subjects,
}: {
  profId: string;
  subjects: string[];
}) {
  const [state, formAction, pending] = useActionState(
    createAppointment.bind(null, profId),
    initialState
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="date" className="mb-1 block text-sm font-medium text-slate-700">
            Date
          </label>
          <input
            id="date"
            name="date"
            type="date"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="time" className="mb-1 block text-sm font-medium text-slate-700">
            Heure
          </label>
          <input
            id="time"
            name="time"
            type="time"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label htmlFor="subject" className="mb-1 block text-sm font-medium text-slate-700">
          Matière
        </label>
        {subjects.length > 0 ? (
          <select
            id="subject"
            name="subject"
            required
            defaultValue=""
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          >
            <option value="" disabled>
              Choisis une matière
            </option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        ) : (
          <input
            id="subject"
            name="subject"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            placeholder="Ex : Mathématiques"
          />
        )}
      </div>

      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-medium text-slate-700">
          Message (optionnel)
        </label>
        <textarea
          id="message"
          name="message"
          rows={3}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          placeholder="Précise ta demande..."
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
        {pending ? "Envoi..." : "Envoyer la demande"}
      </button>
    </form>
  );
}
