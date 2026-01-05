import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const rootDir = path.resolve(import.meta.dirname, "..");

  const possiblePaths = [
    path.resolve(rootDir, "public"),
    path.resolve(rootDir, "dist", "public"),
    path.resolve(import.meta.dirname, "public"),
  ];

  const distPath = possiblePaths.find(p => fs.existsSync(p));

  if (!distPath) {
    console.error(
      `Could not find the build directory. Searched: ${possiblePaths.join(", ")}`
    );
    return;
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
