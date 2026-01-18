import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { logger } from "hono/logger";
import { injectParams, resolvePage } from "./resolvePage.ts";

const port = Number(process.env.PORT) || 3000;
const rootDir = resolve(import.meta.dirname, "..");

const app = new Hono();

app.use("*", logger());

// API routes
app.get("/api/health", (c) => {
	return c.json({ ok: true, timestamp: new Date().toISOString() });
});

// Static assets (before catch-all!)
app.use("/assets/*", serveStatic({ root: "./dist" }));
app.use("/vite.svg", serveStatic({ root: "./dist" }));

// Page routes with dynamic [param] support
app.get("*", async (c) => {
	const urlPath = new URL(c.req.url).pathname;
	const distDir = join(rootDir, "dist");

	const resolved = resolvePage(urlPath, distDir);

	if (resolved) {
		let html = readFileSync(resolved.htmlPath, "utf-8");
		html = injectParams(html, resolved.params);
		return c.html(html);
	}

	return c.notFound();
});

console.log(`🚀 Server running at http://localhost:${port}`);
console.log(`📦 Mode: production`);
console.log(`⚡ Runtime: Bun ${Bun.version}`);

Bun.serve({
	port,
	fetch: app.fetch,
});
