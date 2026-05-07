# ========================================
# Stage 1: Install dependencies
# ========================================
FROM oven/bun:1 AS deps

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# ========================================
# Stage 2: Build app
# ========================================
FROM oven/bun:1 AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time env vars (baked into client bundle by Vite)
ARG NEXT_PUBLIC_CREATE_ENV=DEVELOPMENT
ARG NEXT_PUBLIC_APP_URL=http://localhost:3038
ARG NEXT_PUBLIC_BASE_URL=http://localhost:3038
ARG NEXT_PUBLIC_HOST=localhost:3038
ARG ANYTHING_PROJECT_TOKEN=""

ENV NEXT_PUBLIC_CREATE_ENV=$NEXT_PUBLIC_CREATE_ENV
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_HOST=$NEXT_PUBLIC_HOST
ENV ANYTHING_PROJECT_TOKEN=$ANYTHING_PROJECT_TOKEN

RUN bun run build

# ========================================
# Stage 3: Production runner
# ========================================
FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Create logs directory
RUN mkdir -p /app/logs

# Copy built output and runtime deps
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Copy entrypoint script
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN sed -i 's/\r$//' /app/docker-entrypoint.sh && chmod +x /app/docker-entrypoint.sh

EXPOSE 4000

# Health check
HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

ENTRYPOINT ["/app/docker-entrypoint.sh"]
