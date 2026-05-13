# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS builder

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./prisma.config.ts
COPY nest-cli.json ./
COPY tsconfig.json tsconfig.build.json ./
COPY src ./src

RUN npm ci --include=dev --no-audit --no-fund && npm run build

# --- runtime : deps prod + client Prisma + artefacts compilés ---

FROM node:22-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN apt-get update -y && apt-get install -y openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./prisma.config.ts

RUN npm ci --omit=dev --no-audit --no-fund

COPY --from=builder /app/dist ./dist

EXPOSE 3000

# À l'exécution : DATABASE_URL requis. Le fichier .env n'est pas copié dans l'image.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
