// La colonne profiles.subjects est stockée en texte simple (text) sur la
// base réelle, pas en tableau Postgres (text[]) comme le code le
// supposait à l'origine. Selon comment la ligne a été écrite, la valeur
// lue peut être un vrai tableau JS (client Postgres compatible), une
// chaîne JSON ("[\"SES\"]"), ou une simple liste séparée par des
// virgules. Cette fonction normalise tout ça en string[] pour l'affichage.
export function normalizeSubjects(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter(
      (v): v is string => typeof v === "string" && v.length > 0
    );
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.filter(
            (v): v is string => typeof v === "string" && v.length > 0
          );
        }
      } catch {
        // Pas du JSON valide : on retombe sur un découpage par virgule.
      }
    }
    return trimmed
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  return [];
}
