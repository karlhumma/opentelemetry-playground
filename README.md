# OpenTelemetry Playground

Full-stack TypeScript sandbox showcasing OpenTelemetry tracing with a React + Vite client, Node.js + Express + tRPC server, MySQL via Drizzle, and Jaeger for visualization. Docker Compose runs everything locally.

## Stack

- React 19 (Vite) frontend
- Node.js 22, Express, tRPC backend
- MySQL (Drizzle ORM)
- OpenTelemetry SDK exporting to Jaeger OTLP
- Docker Compose for app + db + Jaeger
- Security Hardening: Production startup checks for required secrets.
- GenAI Observability: LLM calls instrumented with OTel Semantic Conventions (gen_ai.*).

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

## Environment Variables

The application enforces strict validation in production. The following variables are **mandatory**:

| Variable | Description |
| :--- | :--- |
| `JWT_SECRET` | Secret key for signing session cookies. |
| `BUILT_IN_FORGE_API_KEY` | API Key for the LLM provider. |
| `OAUTH_SERVER_URL` | Base URL for the OAuth provider (must be a valid URL). |
| `OTEL_EXPORTER_OTLP_ENDPOINT`| URL for the OpenTelemetry collector (e.g., `http://jaeger:4318/v1/traces`). |

> **Note:** If any of these are missing in `NODE_ENV=production`, the server will log a critical security error and exit immediately.

## Development Mode

For local development, you can bypass the production environment variable checks by setting `NODE_ENV=development`. This will disable the strict validation of `JWT_SECRET`, `BUILT_IN_FORGE_API_KEY`, and `OAUTH_SERVER_URL`.

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
