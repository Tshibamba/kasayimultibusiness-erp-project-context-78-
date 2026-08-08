# KasayiMultiBusiness ERP — Dockerfile multi-stage
FROM node:22-slim AS base

# Stage 1 : Installation des dépendances
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Stage 2 : Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx next typegen && npm run build

# Stage 3 : Production
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/drizzle.config.json ./drizzle.config.json
COPY --from=builder /app/src/db/schema.ts ./src/db/schema.ts

USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
