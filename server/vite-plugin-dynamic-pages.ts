import { readFileSync } from "node:fs";
import { relative } from "node:path";
import type { Plugin, ViteDevServer } from "vite";
import { injectParams, resolvePage } from "./resolvePage.ts";

/**
 * Vite plugin to handle file-based page routing with dynamic [param] support
 * Works with Vite's transform pipeline so React refresh works
 */
export function dynamicPages(pagesDir: string): Plugin {
	let server: ViteDevServer;

	return {
		name: "dynamic-pages",
		configureServer(devServer) {
			server = devServer;

			// Add middleware after Vite's internal middleware
			return () => {
				server.middlewares.use(async (req, res, next) => {
					const url = req.url ?? "/";

					// Skip non-page requests
					if (
						url.startsWith("/@") ||
						url.startsWith("/__") ||
						url.startsWith("/api") ||
						url.startsWith("/node_modules") ||
						url.includes(".")
					) {
						return next();
					}

					// Redirect non-root paths without trailing slash to add one
					// This ensures relative paths in HTML resolve correctly
					if (url !== "/" && !url.endsWith("/")) {
						res.statusCode = 302;
						res.setHeader("Location", `${url}/`);
						res.end();
						return;
					}

					// Try to resolve as a page
					const resolved = resolvePage(url, pagesDir);

					if (resolved) {
						let html = readFileSync(resolved.htmlPath, "utf-8");
						html = injectParams(html, resolved.params);

						// Rewrite script paths if scriptDir differs from htmlPath's dir
						// (for dynamic routes or fallback templates)
						const scriptRelDir = `/${relative(pagesDir, resolved.scriptDir)}`;
						if (
							resolved.isFallback ||
							Object.keys(resolved.params).length > 0
						) {
							html = html.replace(
								/src="\.\/([^"]+)"/g,
								`src="${scriptRelDir}/$1"`,
							);
						}

						// Get the path relative to pagesDir for Vite transform
						const relativePath = `/${relative(pagesDir, resolved.htmlPath)}`;

						// Transform through Vite (adds HMR, React refresh, etc.)
						html = await server.transformIndexHtml(relativePath, html);

						res.statusCode = 200;
						res.setHeader("Content-Type", "text/html");
						res.end(html);
						return;
					}

					next();
				});
			};
		},
	};
}
