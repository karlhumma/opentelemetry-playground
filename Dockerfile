# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Prevent pnpm from asking interactive questions (fixes build hangs)
ENV CI=true

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
# This runs "esbuild ... --outfile=dist/server/main.mjs" as per package.json
RUN pnpm build

# OpenTelemetry Collector download stage
FROM alpine:3.19 AS otelcol-downloader

# Install curl and ca-certificates for downloading
RUN apk add --no-cache curl ca-certificates

# Download otelcol binary
ARG OTELCOL_VERSION=0.142.0
ARG TARGETARCH=amd64

RUN curl -fsSL "https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v${OTELCOL_VERSION}/otelcol-contrib_${OTELCOL_VERSION}_linux_${TARGETARCH}.tar.gz" \
    | tar -xzf - -C /tmp \
    && chmod +x /tmp/otelcol-contrib \
    && mv /tmp/otelcol-contrib /usr/local/bin/otelcol

# Production stage
FROM node:22-alpine AS runner

WORKDIR /app

# Prevent pnpm from asking interactive questions
ENV CI=true

# Install runtime deps
RUN apk add --no-cache ca-certificates libc6-compat libgcc libstdc++

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

# Copy otelcol binary
COPY --from=otelcol-downloader /usr/local/bin/otelcol /usr/local/bin/otelcol

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches

# Install production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy built application from builder
# Ensure we copy the entire dist folder
COPY --from=builder /app/dist ./dist

# Create temp directory for validation
RUN mkdir -p /tmp/otel-validator && chown appuser:nodejs /tmp/otel-validator

# Set ownership
RUN chown -R appuser:nodejs /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV OTELCOL_PATH=/usr/local/bin/otelcol

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start the application
# Matching package.json output: main.mjs
CMD ["node", "dist/server/main.mjs"]
