import { existsSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import devServer from "@hono/vite-dev-server";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { dynamicPages } from "./server/vite-plugin-dynamic-pages.ts";
import { generateMissingHtml } from "./server/vite-plugin-generate-html.ts";

const pagesDir = resolve(__dirname, "src/pages");

// Generate missing HTML files before discovering inputs
// (must be called before getPageInputs)
const htmlGenerator = generateMissingHtml(pagesDir);

// Discover all HTML files in src/pages for MPA
function getPageInputs() {
	const inputs: Record<string, string> = {};

	function scanDir(dir: string, prefix = "") {
		if (!existsSync(dir)) return;

		const entries = readdirSync(dir, { withFileTypes: true });

		// Check for index.html in current directory
		const hasIndex = entries.some((e) => e.isFile() && e.name === "index.html");
		if (hasIndex) {
			const name = prefix || "main";
			inputs[name] = join(dir, "index.html");
		}

		// Recurse into subdirectories
		for (const entry of entries) {
			if (entry.isDirectory()) {
				const subPrefix = prefix ? `${prefix}/${entry.name}` : entry.name;
				scanDir(join(dir, entry.name), subPrefix);
			}
		}
	}

	scanDir(pagesDir);
	return inputs;
}

export default defineConfig({
	appType: "mpa",
	plugins: [
		react(),
		htmlGenerator,
		// Handle dynamic [param] routes (dev only)
		dynamicPages(pagesDir),
		// Handle API routes via Hono (dev only)
		devServer({
			entry: "server/app.ts",
			exclude: [/^(?!\/api).*/],
		}),
	],
	root: "src/pages",
	publicDir: resolve(__dirname, "public"),
	build: {
		outDir: resolve(__dirname, "dist"),
		emptyOutDir: true,
		rollupOptions: {
			input: getPageInputs(),
		},
	},
	resolve: {
		alias: {
			"@shared": resolve(__dirname, "src/shared"),
		},
	},
});
