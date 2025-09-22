# syntax=docker/dockerfile:1
FROM oven/bun:1.2.22-alpine AS base
WORKDIR /app

# Install libc6-compat to avoid some node libs issues
RUN apk add --no-cache libc6-compat

# Copy package manifests and lock if exists
COPY package.json tsconfig.json prisma ./
COPY src ./src
COPY .env ./.env || true

# Install dependencies and generate prisma
RUN bun install --frozen-lockfile || bun install \
 && npx prisma generate

# Build (for TS -> JS)
RUN bun run build

# Runtime image
FROM oven/bun:1.2.22-alpine AS runtime
WORKDIR /app
RUN apk add --no-cache libc6-compat

ENV NODE_ENV=production
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
COPY --from=base /app/prisma ./prisma
COPY --from=base /app/.env ./.env

EXPOSE 3000
CMD ["bun", "run", "start"]
