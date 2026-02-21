import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { type Server } from "http";

// Vite is only used in development; import it conditionally to avoid
// loading vite.config.ts and its dependencies in production
let viteLogger: any = null;

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  // Dynamically import Vite modules only when called (development-only)
  const { createServer: createViteServer, createLogger } = await import("vite");
  const viteConfig = (await import("../vite.config.ts")).default;

  // Initialize logger on first call
  if (!viteLogger) {
    viteLogger = createLogger();
  }

  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg: string, options?: any) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      // Let Vite handle module cache-busting; don't inject query params here
      // Vite's transformIndexHtml already handles module reloading correctly
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const primaryDistPath = path.resolve(import.meta.dirname, "public");
  const fallbackMarker = path.resolve(import.meta.dirname, "USE_FALLBACK_OUTDIR");

  let distPath = primaryDistPath;

  if (fs.existsSync(fallbackMarker)) {
    const fallbackPath = fs.readFileSync(fallbackMarker, 'utf8').trim();
    if (fs.existsSync(fallbackPath)) {
      console.log(`[serveStatic] Using fallback static directory: ${fallbackPath}`);
      distPath = fallbackPath;
    }
  }

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Protect against EPERM/stat permission errors on specific asset files by
  // pre-checking access for requests under /assets. If an EPERM occurs we
  // short-circuit with a 404 instead of allowing Express's static handler to
  // repeatedly attempt to stat the file and log many errors.
  const warned = new Set<string>();
  app.use('/assets', async (req, res, next) => {
    try {
      // Normalize and resolve the requested path under the dist directory
      const relPath = decodeURIComponent(req.path || '');
      const filePath = path.join(distPath, relPath);
      if (!filePath.startsWith(distPath)) return next();

      await fs.promises.stat(filePath);
      return next();
    } catch (err: any) {
      // If the error is EPERM, warn once and return 404 so the server continues
      if (err && err.code === 'EPERM') {
        const key = String(req.path);
        if (!warned.has(key)) {
          warned.add(key);
          console.warn(`[serveStatic] EPERM accessing ${req.path} — returning 404`);
        }
        return res.status(404).end();
      }
      // For other errors (ENOENT etc) just pass through to the static handler
      return next();
    }
  });

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
