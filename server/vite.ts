import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import path from "path";

export async function setupVite(app: Express, server: Server) {
  // Dynamically import vite only in development mode
  const { createServer: createViteServer } = await import("vite");
  const { nanoid } = await import("nanoid");
  // @ts-ignore - vite.config.ts is outside server dir
  const viteConfig = (await import("../vite.config")).default;

  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      // DEV MODE: Look for client relative to project root (CWD)
      const clientTemplate = path.resolve(process.cwd(), "client", "index.html");

      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // PROD MODE: Look for 'dist/public' or 'public' relative to CWD (/app)
  const possiblePaths = [
    path.resolve(process.cwd(), "dist", "public"), // Standard build output
    path.resolve(process.cwd(), "public"),         // Fallback
  ];

  const distPath = possiblePaths.find(p => fs.existsSync(p));

  if (!distPath) {
    console.error(
      `Could not find the build directory. Searched: ${possiblePaths.join(", ")}`
    );
    return;
  }

  app.use(express.static(distPath));

  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
