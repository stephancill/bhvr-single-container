import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

export interface ResolvedPage {
	htmlPath: string;
	params: Record<string, string>;
	/** Directory containing main.tsx (may differ from htmlPath's dir if using fallback) */
	scriptDir: string;
	/** True if using root index.html as fallback */
	isFallback: boolean;
}

/**
 * Resolves a URL path to an HTML file path, supporting dynamic [param] segments.
 * Falls back to root index.html if directory has main.tsx but no index.html.
 */
export function resolvePage(
	urlPath: string,
	pagesDir: string,
): ResolvedPage | null {
	// Normalize the path and filter empty segments (from trailing slashes)
	const normalizedPath = urlPath === "/" ? "" : urlPath.replace(/^\//, "");
	const segments = normalizedPath
		? normalizedPath.split("/").filter((s) => s !== "")
		: [];

	return resolveSegments(segments, pagesDir, pagesDir, {});
}

function resolveSegments(
	segments: string[],
	currentDir: string,
	pagesDir: string,
	params: Record<string, string>,
): ResolvedPage | null {
	// Base case: no more segments
	if (segments.length === 0) {
		const htmlPath = join(currentDir, "index.html");
		const mainPath = join(currentDir, "index.tsx");

		// Has index.html - use it directly
		if (existsSync(htmlPath)) {
			return { htmlPath, params, scriptDir: currentDir, isFallback: false };
		}

		// Has main.tsx but no index.html - use root's index.html as fallback
		if (existsSync(mainPath)) {
			const rootHtml = join(pagesDir, "index.html");
			if (existsSync(rootHtml)) {
				return {
					htmlPath: rootHtml,
					params,
					scriptDir: currentDir,
					isFallback: true,
				};
			}
		}

		return null;
	}

	const [currentSegment, ...remainingSegments] = segments;

	// Check if current directory exists
	if (!existsSync(currentDir) || !statSync(currentDir).isDirectory()) {
		return null;
	}

	const entries = readdirSync(currentDir, { withFileTypes: true });
	const directories = entries.filter((e) => e.isDirectory());

	// First try exact match
	const exactMatch = directories.find((d) => d.name === currentSegment);
	if (exactMatch) {
		const result = resolveSegments(
			remainingSegments,
			join(currentDir, exactMatch.name),
			pagesDir,
			params,
		);
		if (result) return result;
	}

	// Then try dynamic [param] folders
	const dynamicFolders = directories.filter(
		(d) => d.name.startsWith("[") && d.name.endsWith("]"),
	);

	for (const folder of dynamicFolders) {
		const paramName = folder.name.slice(1, -1); // Remove [ and ]
		const result = resolveSegments(
			remainingSegments,
			join(currentDir, folder.name),
			pagesDir,
			{ ...params, [paramName]: currentSegment },
		);
		if (result) return result;
	}

	return null;
}

/**
 * Injects window.__PARAMS__ into HTML content
 */
export function injectParams(
	html: string,
	params: Record<string, string>,
): string {
	const script = `<script>window.__PARAMS__ = ${JSON.stringify(params)};</script>`;
	// Inject before closing </head> tag, or at the start of <body>
	if (html.includes("</head>")) {
		return html.replace("</head>", `${script}</head>`);
	}
	if (html.includes("<body>")) {
		return html.replace("<body>", `<body>${script}`);
	}
	// Fallback: prepend to HTML
	return script + html;
}
