# ── Stage 1: Install dependencies ─────────────────────────────────────────────
FROM node:22-alpine AS deps
RUN corepack enable && corepack prepare pnpm@10.11.0 --activate
WORKDIR /app

# Copy only the files pnpm needs to resolve and install dependencies.
# This layer is cached until a lockfile or workspace structure changes.
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY products/vita/package.json ./products/vita/
COPY packages/monolithium/package.json ./packages/monolithium/
COPY packages/bridge/package.json ./packages/bridge/
COPY packages/tanstack/package.json ./packages/tanstack/
COPY packages/utilities/package.json ./packages/utilities/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/prettier-config/package.json ./packages/prettier-config/
COPY packages/stylelint-config/package.json ./packages/stylelint-config/

RUN pnpm install --frozen-lockfile

# ── Stage 2: Build ────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@10.11.0 --activate
WORKDIR /app

COPY --from=deps /app/ ./
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY


RUN pnpm --filter @monocircuit/vita build

# ── Stage 3: Production runner ────────────────────────────────────────────────
FROM node:22-alpine AS runner
RUN apk upgrade --no-cache
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Next.js standalone output preserves the monorepo directory structure
# because outputFileTracingRoot is set to "../../" in next.config.ts.
COPY --from=builder /app/products/vita/public ./products/vita/public
COPY --from=builder --chown=nextjs:nodejs /app/products/vita/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/products/vita/.next/static ./products/vita/.next/static

USER nextjs
EXPOSE 3000
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

CMD ["node", "products/vita/server.js"]
