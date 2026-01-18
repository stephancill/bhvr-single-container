// Extend Window to include __PARAMS__
declare global {
	interface Window {
		__PARAMS__?: Record<string, string>;
	}
}

export function getParams(): Record<string, string> {
	return window.__PARAMS__ ?? {};
}

export function getParam(key: string): string | undefined {
	return getParams()[key];
}
