# CinéList

Une petite appli pour toi et tes amis : ajoutez des films/séries, notez-les de 1 à 10,
commentez, et suivez le classement du groupe.

## Démarrage en local

Il te faut [Node.js](https://nodejs.org) (version 18 ou plus) installé.

```bash
# 1. Installer les dépendances
npm install

# 2. Copier le fichier d'environnement et le remplir
cp .env.example .env
```

Ouvre `.env` et modifie :
- `NEXTAUTH_SECRET` : génère une valeur avec `openssl rand -base64 32`
- `INVITE_CODE` : le code que tu donneras à tes amis pour qu'ils puissent créer un compte
  (ça empêche n'importe qui de s'inscrire si l'appli est en ligne)

```bash
# 3. Créer la base de données SQLite
npm run db:push

# 4. Lancer l'appli
npm run dev
```

Ouvre http://localhost:3000, clique sur "S'inscrire", crée ton compte avec le code
d'invitation, puis partage le lien + le code à tes amis pour qu'ils fassent pareil.

## Fonctionnement

- **Comptes** : chacun crée son compte avec le code d'invitation (pas d'inscription publique ouverte).
- **Ajouter un titre** : nom, type (film/série), année, résumé, affiche (lien d'image optionnel).
- **Noter** : chacun donne sa propre note de 1 à 10 à chaque titre. La note affichée sur la
  page d'accueil est la moyenne de toutes les notes du groupe.
- **Commenter** : chaque titre a un fil de commentaires.
- **Classement** : la page d'accueil trie automatiquement par note moyenne (onglet "Classement")
  ou par date d'ajout (onglet "Récents"), avec un filtre Film/Série.
- Seule la personne qui a ajouté un titre peut le supprimer.

## Déployer en ligne (pour que tout le monde y accède sans que ton PC soit allumé)

Le plus simple est **Vercel** (gratuit pour ce genre de projet) :

1. Crée un repo GitHub avec ce code (`git init`, `git add .`, `git commit`, push).
2. Va sur [vercel.com](https://vercel.com), importe le repo.
3. Comme SQLite ne fonctionne pas bien sur Vercel (système de fichiers non persistant),
   remplace la base par une base hébergée gratuite compatible Prisma, par exemple
   [Turso](https://turso.tech) ou [Neon](https://neon.tech) (Postgres) — il suffit de
   changer `provider` dans `prisma/schema.prisma` et l'URL dans les variables d'environnement
   Vercel.
4. Ajoute dans les variables d'environnement Vercel : `DATABASE_URL`, `NEXTAUTH_SECRET`,
   `NEXTAUTH_URL` (l'URL Vercel de ton app), `INVITE_CODE`.

Si tu préfères rester 100% simple sans toucher au code, tu peux aussi héberger l'appli
telle quelle (avec SQLite) sur une petite VM (Railway, Render, Fly.io) qui garde un disque
persistant — demande-moi et je t'accompagne quand tu seras prêt à déployer.

## Idées d'évolutions possibles

- Récupérer automatiquement affiche/résumé via l'API [TMDb](https://www.themoviedb.org/documentation/api) (gratuite) au lieu de les saisir à la main
- Notifications quand un ami ajoute ou note un titre
- Système de "à voir" / "vu" par personne
- Commentaires avec spoilers cachables

## Stack technique

Next.js 14 (App Router) · SQLite + Prisma · NextAuth (comptes email/mot de passe)
