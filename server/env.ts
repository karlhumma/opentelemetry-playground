import "dotenv/config";

const isProduction = process.env.NODE_ENV === "production";

export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction,
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
};

// Security Hardening: Validate critical secrets in production
function validateEnv() {
  if (!isProduction) {
    console.warn("[Security] Skipping environment validation in development mode.");
    return;
  }

  const missing = [];
  if (!ENV.cookieSecret) missing.push("JWT_SECRET");
  if (!ENV.forgeApiKey) missing.push("BUILT_IN_FORGE_API_KEY");
  if (!ENV.oAuthServerUrl) missing.push("OAUTH_SERVER_URL");

  if (missing.length > 0) {
    console.error(
      `[Security] CRITICAL: Missing required environment variables in production: ${missing.join(", ")}`
    );
    process.exit(1); // Fail fast
  }
}

validateEnv();
