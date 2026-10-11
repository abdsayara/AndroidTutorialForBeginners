# syntax=docker/dockerfile:1.7
FROM node:22-bookworm-slim AS deps
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS build
WORKDIR /app
COPY . .
RUN npx prisma generate && npm run build

# Runtime: Next.js standalone server + Chromium (for Arabic RTL PDF export) + prisma CLI for migrations.
FROM node:22-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production CHROMIUM_PATH=/usr/bin/chromium PORT=3000 HOSTNAME=0.0.0.0
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates chromium fonts-noto-core \
  && rm -rf /var/lib/apt/lists/* && groupadd -r app && useradd -r -g app -m app
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/src ./src
COPY --from=build /app/messages ./messages
COPY --from=build /app/package.json /app/tsconfig.json ./
USER app
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
