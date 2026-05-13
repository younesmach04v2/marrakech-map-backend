# Marrakech Map — API (NestJS)

Backend NestJS + Prisma (PostgreSQL) pour l’application carte Marrakech.

## Prérequis

- Node.js **20.11+** (recommandé : **22**, voir `nixpacks.toml` / `.node-version` pour Railway)
- PostgreSQL

## Installation

```bash
npm install
npx prisma generate
```

Copier `.env.example` vers `.env` et renseigner les variables.

## Développement

```bash
npm run start:dev
```

## Production (build local)

```bash
npm run build
npm run start:prod
```

## Déploiement (Railway)

1. Crée un service **PostgreSQL** puis un service **Node** pointant vers ce dépôt.
2. Sur le service backend : **Variables** → ajoute une référence à `DATABASE_URL` depuis le service Postgres (recommandé dans le même projet), ou colle une URL valide.
3. Définis au minimum **`JWT_SECRET`** (chaîne longue et aléatoire).
4. Optionnel : **`FRONTEND_URL`** avec l’URL de ton front (CORS), ex. `https://mon-app.vercel.app`.
5. Le fichier `railway.toml` exécute un build avec **`npm ci --include=dev`** (nécessaire pour que `nest build` ait `@nestjs/cli` et `typescript`), puis **`npm run start:prod`**. Sans cela, tu peux voir `Cannot find module '/app/dist/main'`.

Si le backend tourne **hors** de Railway (ex. Vercel) alors que la base est sur Railway, utilise l’URL **publique** Postgres (`*.proxy.rlwy.net` / variable du type public), pas l’hôte `*.railway.internal`.

## Déploiement (Vercel ou autre hébergeur)

Déclare les mêmes variables dans le tableau de bord de la plateforme : au minimum **`DATABASE_URL`**, **`JWT_SECRET`**, et **`FRONTEND_URL`** si besoin. Les fichiers `.env` ne sont pas déployés automatiquement.

## Scripts utiles

| Script            | Rôle                          |
|-------------------|--------------------------------|
| `npm run build`   | Compile Nest (`dist/`)        |
| `npm run start:prod` | Lance `node dist/main`     |
| `postinstall`     | `prisma generate` après install |

## Licence

UNLICENSED (projet privé / scolaire).
