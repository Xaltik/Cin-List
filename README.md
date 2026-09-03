# CinéList

Une petite appli pour toi et tes amis : ajoutez des films/séries, notez-les de 1 à 10,
commentez, et suivez le classement du groupe.

**🎬 App en ligne : [cinelist-lac.vercel.app](https://cinelist-lac.vercel.app)**

## Démarrage en local

Il te faut [Node.js](https://nodejs.org) (version 18 ou plus) installé.

La base de données de prod est un Postgres hébergé sur [Neon](https://neon.tech), connecté au
projet Vercel. Pour développer en local avec cette même base :

```bash
# 1. Installer les dépendances
npm install

# 2. Récupérer les variables d'environnement du projet Vercel (nécessite `npx vercel link` une
# première fois si ce n'est pas déjà fait)
npx vercel env pull .env.local
```

Ça remplit `.env.local` avec `DATABASE_URL` (Neon), `NEXTAUTH_SECRET` et `INVITE_CODE`. Ajoute-y
aussi `NEXTAUTH_URL="http://localhost:3000"` pour le local.

```bash
# 3. Lancer l'appli
npm run dev
```

Si tu préfères une base SQLite locale indépendante (sans toucher à la prod), remets
`provider = "sqlite"` dans `prisma/schema.prisma`, copie `.env.example` en `.env` et lance
`npm run db:push`.

Ouvre http://localhost:3000, clique sur "S'inscrire", crée ton compte avec le code
d'invitation, puis partage le lien + le code à tes amis pour qu'ils fassent pareil.

## Fonctionnement

- **Comptes** : chacun crée son compte avec le code d'invitation (pas d'inscription publique ouverte).
- **Ajouter un titre** : tape juste le nom — si `TMDB_API_KEY` est configurée, des suggestions
  TMDb apparaissent (affiche, année, résumé pré-remplis, éditables ensuite). Sinon saisie manuelle.
- **Statut "à voir" / "vu"** : indépendant de la notation, propre à chaque personne. Filtrable
  depuis la page d'accueil.
- **Noter** : chacun donne sa propre note de 1 à 10 à chaque titre. La note affichée sur la
  page d'accueil est la moyenne de toutes les notes du groupe.
- **Commenter** : chaque titre a un fil de commentaires.
- **Classement** : la page d'accueil trie automatiquement par note moyenne (onglet "Classement")
  ou par date d'ajout (onglet "Récents"), avec des filtres Film/Série et Statut.
- Seule la personne qui a ajouté un titre peut le supprimer.

## Déployé en ligne

L'appli tourne sur **Vercel** : [cinelist-lac.vercel.app](https://cinelist-lac.vercel.app),
connectée au repo GitHub (chaque push sur `main` redéploie automatiquement) et à une base
**Neon Postgres** provisionnée via l'intégration marketplace Vercel.

Variables d'environnement configurées sur Vercel (Production) : `DATABASE_URL` (+ variantes
Neon, injectées automatiquement), `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `INVITE_CODE`,
`TMDB_API_KEY` (optionnelle — voir `.env.example`).

Pour redéployer manuellement ou gérer les variables :

```bash
npx vercel --prod          # déployer
npx vercel env ls          # lister les variables d'env
npx vercel env add NOM production   # ajouter/modifier une variable
```

## Idées d'évolutions possibles

- Notifications quand un ami ajoute ou note un titre
- Commentaires avec spoilers cachables
- Modifier un titre après ajout, supprimer/éditer son propre commentaire
- Récupération de mot de passe

## Stack technique

Next.js 14 (App Router) · Postgres (Neon) + Prisma · NextAuth (comptes email/mot de passe) ·
déployé sur Vercel
