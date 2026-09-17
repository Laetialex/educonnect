"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Profile, Role } from "@/types/database";

export type UpsertProfileState = {
  error: string | null;
};

export async function upsertProfile(
  _prevState: UpsertProfileState,
  formData: FormData
): Promise<UpsertProfileState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/connexion?next=/profil");
  }

  const role = formData.get("role") as Role;
  const name = (formData.get("name") as string)?.trim();
  const subjectsRaw = (formData.get("subjects") as string) ?? "";
  const subjects = subjectsRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const availability = (formData.get("availability") as string)?.trim() || null;

  if (!name) {
    return { error: "Le nom est obligatoire." };
  }

  const profile: Profile =
    role === "professeur"
      ? {
          id: user.id,
          role,
          name,
          subjects,
          profession: (formData.get("profession") as string)?.trim() || null,
          availability,
          level: null,
          problems: null,
        }
      : {
          id: user.id,
          role,
          name,
          subjects,
          level: (formData.get("level") as string)?.trim() || null,
          problems: (formData.get("problems") as string)?.trim() || null,
          availability,
          profession: null,
        };

  const { error } = await supabase.from("profiles").upsert(profile);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/annuaire");
  redirect("/profil?enregistre=1");
}
