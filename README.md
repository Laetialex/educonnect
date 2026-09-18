# EduConnect

Plateforme Next.js qui met en relation élèves et professeurs particuliers, avec Supabase (base de données + authentification par email).

## Fonctionnalités actuelles

1. **Page d'accueil** avec deux parcours : « Je suis élève » / « Je suis professeur ».
2. **Inscription / connexion par email** via Supabase Auth (`src/app/auth/inscription`, `src/app/auth/connexion`), avec mot de passe oublié (`src/app/auth/reinitialiser-mot-de-passe`).
3. **Formulaire de dossier** (`src/app/profil`) qui enregistre le profil (élève ou professeur) dans la table `profiles`.
4. **Annuaire** (`src/app/annuaire`) qui affiche tous les profils enregistrés dans Supabase, avec page de profil public, messagerie et prise de rendez-vous.

## Configuration

1. Copie `.env.local.example` vers `.env.local` :

   ```bash
   cp .env.local.example .env.local
   ```

2. Remplis `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` avec les valeurs de ton projet Supabase (Project Settings → API).

3. Assure-toi que la Row Level Security (RLS) de la table `profiles` autorise :
   - `select` pour tout le monde (anon + authenticated), pour que l'annuaire fonctionne sans connexion ;
   - `insert`/`update` uniquement quand `auth.uid() = id`, pour que chaque utilisateur ne modifie que son propre profil.

4. **Templates d'email (obligatoire)** — la confirmation d'inscription et la réinitialisation de mot de passe utilisent un **code numérique** (pas un lien magique). Ce code existe toujours côté Supabase, mais il n'apparaît dans l'email que si le template l'affiche. Va dans **Authentication → Email Templates** et ajoute `{{ .Token }}` dans le corps de ces deux templates :

   - Template **Confirm signup**, ajoute par exemple :
     ```html
     <p>Ton code de confirmation : <strong>{{ .Token }}</strong></p>
     ```
   - Template **Reset Password**, ajoute par exemple :
     ```html
     <p>Ton code de réinitialisation : <strong>{{ .Token }}</strong></p>
     ```

   Sans cette modification, le code est généré par Supabase mais jamais envoyé à l'utilisateur, et les pages « code de vérification » de l'app ne pourront jamais être validées.

   La **longueur** du code (`OTP Length` dans **Authentication → Sign In / Providers → Email**, 8 chiffres sur ce projet) doit correspondre à la constante `OTP_LENGTH` définie dans `src/lib/auth.ts`. Si tu changes ce réglage côté Supabase, mets aussi à jour cette constante.

## Lancer le projet en local

```bash
npm install
npm run dev
```

Le site est ensuite disponible sur http://localhost:3000.

## Structure du code

- `src/lib/supabase/client.ts` — client Supabase côté navigateur (composants "use client").
- `src/lib/supabase/server.ts` — client Supabase côté serveur (Server Components, Server Actions).
- `src/lib/supabase/middleware.ts` + `src/proxy.ts` — rafraîchissement de la session et protection des pages privées (`/profil`).
- `src/types/database.ts` — types TypeScript correspondant aux tables Supabase.
- `src/app/profil/actions.ts` — Server Action qui fait l'upsert dans `profiles`.
