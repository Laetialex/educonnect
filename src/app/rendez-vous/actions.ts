"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateAppointmentStatus(formData: FormData) {
  const appointmentId = formData.get("appointmentId") as string;
  const status = formData.get("status") as string;

  if (!appointmentId || (status !== "accepte" && status !== "refuse")) {
    return;
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  await supabase
    .from("appointments")
    .update({ status })
    .eq("id", appointmentId)
    .eq("prof_id", user.id);

  revalidatePath("/rendez-vous");
}
