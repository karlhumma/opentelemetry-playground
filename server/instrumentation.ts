import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import * as otelResources from "@opentelemetry/resources";
import { SEMRESATTRS_SERVICE_NAME } from "@opentelemetry/semantic-conventions";

const traceExporter = new OTLPTraceExporter({
  url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "http://localhost:4318/v1/traces",
});

// Support both CJS and ESM shapes
const Resource =
  (otelResources as { Resource?: typeof import("@opentelemetry/resources").Resource }).Resource ??
  (otelResources as { default?: { Resource?: typeof import("@opentelemetry/resources").Resource } }).default?.Resource;

if (!Resource) {
  throw new Error("[@opentelemetry/resources] Resource export not found");
}

const sdk = new NodeSDK({
  resource: new Resource({
    [SEMRESATTRS_SERVICE_NAME]: process.env.OTEL_SERVICE_NAME || "opentelemetry-playground",
  }),
  traceExporter,
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();

console.log("[Telemetry] OpenTelemetry SDK started");

// Graceful shutdown
process.on("SIGTERM", () => {
  sdk
    .shutdown()
    .then(() => console.log("[Telemetry] SDK shut down successfully"))
    .catch((error) => console.log("[Telemetry] Error shutting down SDK", error))
    .finally(() => process.exit(0));
});
