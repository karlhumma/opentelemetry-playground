// server/instrumentation.cjs
// server/instrumentation.cjs
const { NodeSDK } = require("@opentelemetry/sdk-node");
const { getNodeAutoInstrumentations } = require("@opentelemetry/auto-instrumentations-node");
const { OTLPTraceExporter } = require("@opentelemetry/exporter-trace-otlp-proto");

if (process.env.NODE_ENV === "production") {
  const targetUrl = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "http://jaeger:4318/v1/traces";
  const serviceName = process.env.OTEL_SERVICE_NAME || "opentelemetry-playground";

  console.log("---------------------------------------------------");
  console.log(`[Telemetry] Initializing SDK`);
  console.log(`[Telemetry] Service Name: ${serviceName}`);
  console.log(`[Telemetry] Target URL:   ${targetUrl}`);
  console.log("---------------------------------------------------");

  try {
    const sdk = new NodeSDK({
      serviceName: serviceName, // Explicitly set service name
      traceExporter: new OTLPTraceExporter({
        url: targetUrl, // Explicitly set URL
      }),
      instrumentations: [getNodeAutoInstrumentations()],
    });

    sdk.start();
    console.log("[Telemetry] OpenTelemetry SDK started successfully");

    process.on("SIGTERM", () => {
      sdk.shutdown().finally(() => process.exit(0));
    });
  } catch (err) {
    console.error("[Telemetry] Failed to start SDK:", err);
  }
}
