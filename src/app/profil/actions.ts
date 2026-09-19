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
  const level = (formData.get("level") as string)?.trim();
  const subjectsRaw = (formData.get("subjects") as string) ?? "";
  const subjects = subjectsRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const availability = (formData.get("availability") as string)?.trim() || null;

  if (!name) {
    return { error: "Le nom est obligatoire." };
  }

  if (!level) {
    return {
      error:
        role === "professeur"
          ? "Choisis au moins un niveau enseigné."
          : "Le niveau scolaire est obligatoire.",
    };
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
          level,
          problems: null,
        }
      : {
          id: user.id,
          role,
          name,
          subjects,
          level,
          problems: (formData.get("problems") as string)?.trim() || null,
          availability,
          profession: null,
        };

  let upsertError: string | null = null;

  try {
    const { error } = await supabase.from("profiles").upsert(profile);
    upsertError = error?.message ?? null;
  } catch {
    upsertError = "Une erreur inattendue est survenue. Réessaie.";
  }

  if (upsertError) {
    return { error: upsertError };
  }

  revalidatePath("/annuaire");
  revalidatePath("/profil");

  // Redirige vers une page publique (non protégée par le middleware
  // d'authentification) plutôt que vers /profil : évite de faire
  // repasser la navigation qui suit la Server Action par le contrôle
  // d'auth d'une route protégée juste après la mutation.
  redirect("/annuaire?enregistre=1");
}
