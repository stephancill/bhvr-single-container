import {
	existsSync,
	readdirSync,
	readFileSync,
	unlinkSync,
	writeFileSync,
} from "node:fs";
import { join } from "node:path";
import type { Plugin } from "vite";

/**
 * Finds directories that have main.tsx but no index.html
 */
function findDirectoriesNeedingHtml(dir: string): string[] {
	const results: string[] = [];

	if (!existsSync(dir)) return results;

	const entries = readdirSync(dir, { withFileTypes: true });

	for (const entry of entries) {
		if (!entry.isDirectory()) continue;

		const subdir = join(dir, entry.name);
		const hasMain = existsSync(join(subdir, "index.tsx"));
		const hasIndex = existsSync(join(subdir, "index.html"));

		if (hasMain && !hasIndex) {
			results.push(subdir);
		}

		// Recurse into subdirectories
		results.push(...findDirectoriesNeedingHtml(subdir));
	}

	return results;
}

/**
 * Vite plugin that generates temporary index.html files for directories
 * that have main.tsx but no index.html (using root template as base)
 *
 * Files are generated immediately when plugin is created (so rollup.input can find them)
 * and cleaned up after the build completes.
 */
export function generateMissingHtml(pagesDir: string): Plugin {
	const generatedFiles: string[] = [];

	// Generate files immediately (before Vite reads config)
	const rootHtmlPath = join(pagesDir, "index.html");
	if (existsSync(rootHtmlPath)) {
		const rootHtml = readFileSync(rootHtmlPath, "utf-8");
		const dirsNeedingHtml = findDirectoriesNeedingHtml(pagesDir);

		for (const dir of dirsNeedingHtml) {
			const htmlPath = join(dir, "index.html");

			// Generate title from directory name
			const pageName = dir.split("/").pop() || "Page";
			const title = pageName.startsWith("[")
				? "Page"
				: pageName.charAt(0).toUpperCase() + pageName.slice(1);

			const html = rootHtml.replace(
				/<title>[^<]*<\/title>/,
				`<title>${title}</title>`,
			);

			writeFileSync(htmlPath, html);
			generatedFiles.push(htmlPath);

			const relativePath = htmlPath.replace(pagesDir, "");
			console.log(`[generate-html] Created temporary ${relativePath}`);
		}
	}

	return {
		name: "generate-missing-html",
		apply: "build",

		closeBundle() {
			// Clean up generated files after build
			for (const file of generatedFiles) {
				if (existsSync(file)) {
					unlinkSync(file);
					const relativePath = file.replace(pagesDir, "");
					console.log(`[generate-html] Cleaned up ${relativePath}`);
				}
			}
		},
	};
}
