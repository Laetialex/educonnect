import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateAppointmentStatus } from "./actions";
import type { Appointment, Profile } from "@/types/database";

const STATUS_LABEL: Record<string, string> = {
  en_attente: "En attente",
  accepte: "Accepté",
  refuse: "Refusé",
};

const STATUS_STYLE: Record<string, string> = {
  en_attente: "bg-amber-100 text-amber-700",
  accepte: "bg-green-100 text-green-700",
  refuse: "bg-red-100 text-red-700",
};

export default async function RendezVousListPage({
  searchParams,
}: PageProps<"/rendez-vous">) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/connexion?next=/rendez-vous");
  }

  const params = await searchParams;
  const justSent = params.envoye === "1";

  const { data: appointments } = await supabase
    .from("appointments")
    .select("*")
    .or(`student_id.eq.${user.id},prof_id.eq.${user.id}`)
    .order("date", { ascending: true })
    .returns<Appointment[]>();

  const otherIds = Array.from(
    new Set(
      (appointments ?? []).map((a) =>
        a.student_id === user.id ? a.prof_id : a.student_id
      )
    )
  );

  const { data: otherProfiles } = otherIds.length
    ? await supabase
        .from("profiles")
        .select("id, name")
        .in("id", otherIds)
        .returns<Pick<Profile, "id" | "name">[]>()
    : { data: [] as Pick<Profile, "id" | "name">[] };

  const nameById = new Map((otherProfiles ?? []).map((p) => [p.id, p.name]));

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-2xl font-bold text-slate-900">Rendez-vous</h1>
      <p className="mt-1 text-sm text-slate-500">
        Tes demandes de rendez-vous, envoyées ou reçues.
      </p>

      {justSent && (
        <p className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          Ta demande de rendez-vous a bien été envoyée ✅
        </p>
      )}

      {(!appointments || appointments.length === 0) && (
        <p className="mt-10 text-center text-slate-500">
          Aucun rendez-vous pour le moment.
        </p>
      )}

      <div className="mt-8 flex flex-col gap-3">
        {appointments?.map((appointment) => {
          const isProfForThis = appointment.prof_id === user.id;
          const otherId = isProfForThis
            ? appointment.student_id
            : appointment.prof_id;
          const otherName = nameById.get(otherId) ?? "Utilisateur";
          const status = appointment.status;

          return (
            <div
              key={appointment.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-slate-900">
                  {isProfForThis ? `Élève : ${otherName}` : `Professeur : ${otherName}`}
                </h2>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    STATUS_STYLE[status] ?? "bg-slate-100 text-slate-600"
                  }`}
                >
                  {STATUS_LABEL[status] ?? status}
                </span>
              </div>

              <p className="mt-2 text-sm text-slate-600">
                {appointment.subject} — {appointment.date} à {appointment.time}
              </p>

              {appointment.message && (
                <p className="mt-2 text-sm text-slate-500">
                  « {appointment.message} »
                </p>
              )}

              {isProfForThis && status === "en_attente" && (
                <form action={updateAppointmentStatus} className="mt-4 flex gap-2">
                  <input type="hidden" name="appointmentId" value={appointment.id} />
                  <button
                    type="submit"
                    name="status"
                    value="accepte"
                    className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-green-700"
                  >
                    Accepter
                  </button>
                  <button
                    type="submit"
                    name="status"
                    value="refuse"
                    className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-700"
                  >
                    Refuser
                  </button>
                </form>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
