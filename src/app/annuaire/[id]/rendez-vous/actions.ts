"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type CreateAppointmentState = {
  error: string | null;
};

export async function createAppointment(
  profId: string,
  _prevState: CreateAppointmentState,
  formData: FormData
): Promise<CreateAppointmentState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/connexion?next=/annuaire/${profId}/rendez-vous`);
  }

  const date = (formData.get("date") as string)?.trim();
  const time = (formData.get("time") as string)?.trim();
  const subject = (formData.get("subject") as string)?.trim();
  const message = (formData.get("message") as string)?.trim() || null;

  if (!date || !time || !subject) {
    return { error: "La date, l'heure et la matière sont obligatoires." };
  }

  const { error } = await supabase.from("appointments").insert({
    student_id: user.id,
    prof_id: profId,
    date,
    time,
    subject,
    message,
    status: "en_attente",
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/rendez-vous?envoye=1");
}
