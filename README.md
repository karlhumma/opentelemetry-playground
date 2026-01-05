# OpenTelemetry Playground

Full-stack TypeScript sandbox showcasing OpenTelemetry tracing with a React + Vite client, Node.js + Express + tRPC server, MySQL via Drizzle, and Jaeger for visualization. Docker Compose runs everything locally.

## Stack

- React 19 (Vite) frontend
- Node.js 22, Express, tRPC backend
- MySQL (Drizzle ORM)
- OpenTelemetry SDK exporting to Jaeger OTLP
- Docker Compose for app + db + Jaeger

## Quickstart (Docker)

```bash
# Build and run the stack (app, MySQL, Jaeger)
docker-compose up --build

# App: http://localhost:3000
# Jaeger: http://localhost:16686
```

## Local Development

```bash
# Install deps
pnpm install

# Start MySQL + Jaeger only
docker-compose up -d db jaeger

# Run dev servers (frontend + backend)
pnpm dev
```

## Telemetry Notes

- Runtime tracing is initialized by loading server/instrumentation.cjs before the app starts. In Docker this is handled automatically.
- Configure destination and service name via environment:
  - OTEL_EXPORTER_OTLP_ENDPOINT (default: http://jaeger:4318/v1/traces in Docker)
  - OTEL_SERVICE_NAME (default: opentelemetry-playground)

## Scripts

- pnpm dev — run frontend/backend in dev mode
- pnpm build — build client + server bundle (CJS) and copy instrumentation
- pnpm test — run vitest suite

## Environment

- PORT (default 3000)
- NODE_ENV (development | production)
- DATABASE_URL (MySQL connection string)
- OTEL_EXPORTER_OTLP_ENDPOINT, OTEL_SERVICE_NAME

## Project Layout

```text
client/          React app (Vite)
server/          Express + tRPC backend (entry: server/main.ts)
shared/          Shared types/constants
docker-compose.yml
Dockerfile
```

## Licensing

MIT License. See LICENSE for details.
