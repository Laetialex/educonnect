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

3. **Policies RLS de `profiles` (obligatoire)** — exécute le contenu de `supabase/migrations/20260918210105_verify_profiles_rls.sql` dans le **SQL Editor** de ton dashboard Supabase (ou via `supabase db push` si tu utilises la Supabase CLI reliée à ce projet). **Ceci ne peut pas être appliqué automatiquement** : merger une PR ou redéployer sur Vercel ne touche que le code de l'app, jamais la base Supabase elle-même — ni la clé `anon`, ni l'app, ni le déploiement ne permettent de créer/modifier des policies RLS, seul un accès SQL direct au projet (dashboard ou CLI) le peut.

   Cette migration **supprime d'abord toutes les policies existantes** sur `profiles` (quel que soit leur nom) avant de recréer exactement celles-ci, et **affiche le résultat** dans le SQL Editor pour vérifier immédiatement que ça a fonctionné (3 lignes attendues) :
   - `select` pour tout le monde (anon + authenticated), pour que l'annuaire fonctionne sans connexion ;
   - `insert`/`update` uniquement quand `auth.uid() = id`, pour que chaque utilisateur ne crée/modifie que son propre profil.

   `profiles.id` **est** `auth.users.id` (convention Supabase standard) — il n'y a pas et il ne faut pas de colonne `user_id` séparée ; toutes les autres tables (`appointments`, `ratings`, `conversations`, `messages`) référencent déjà `profiles.id`.

   Remplace les migrations précédentes (`20260918181846_fix_profiles_rls.sql`, `20260918205407_reset_profiles_rls.sql`, gardées pour l'historique) : utilise la version `verify_profiles_rls`, la plus récente.

   Sans cette migration **effectivement exécutée dans le SQL Editor**, la création de dossier échoue avec l'erreur `new row violates row-level security policy for table "profiles"`.

4. **Contrainte CHECK sur `profiles.role` (obligatoire)** — exécute le contenu de `supabase/migrations/20260919211532_fix_profiles_role_check.sql` dans le **SQL Editor**. La base avait une contrainte `profiles_role_check` qui n'autorisait pas la valeur `"professeur"` (utilisée partout dans le code : `types/database.ts`, formulaires, pages d'affichage), ce qui faisait échouer la création d'un dossier professeur avec `new row for relation "profiles" violates check constraint "profiles_role_check"`. Cette migration remplace la contrainte par `role in ('eleve', 'professeur')` et affiche sa nouvelle définition pour vérification.

5. **Policies RLS de `conversations`/`messages` (obligatoire)** — exécute le contenu de `supabase/migrations/20260919214052_fix_conversations_messages_rls.sql` dans le **SQL Editor**. Ces deux tables n'avaient jamais eu de policies RLS configurées, donc toute écriture y était silencieusement refusée (RLS activée par défaut = tout refusé sans policy). C'est pour ça que cliquer sur « Envoyer un message » ne faisait rien. Cette migration limite la lecture/écriture aux deux participants de chaque conversation (contrairement à `profiles`, ces tables ne sont pas publiques) et affiche les policies créées pour vérification.

6. **Templates d'email (obligatoire)** — la confirmation d'inscription et la réinitialisation de mot de passe utilisent un **code numérique** (pas un lien magique). Ce code existe toujours côté Supabase, mais il n'apparaît dans l'email que si le template l'affiche. Va dans **Authentication → Email Templates** et ajoute `{{ .Token }}` dans le corps de ces deux templates :

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
