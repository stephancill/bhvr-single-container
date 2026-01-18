const API_BASE = "/api";

interface HealthResponse {
	ok: boolean;
	timestamp: string;
}

export async function fetchHealth(): Promise<HealthResponse> {
	const response = await fetch(`${API_BASE}/health`);
	if (!response.ok) {
		throw new Error(`API error: ${response.status}`);
	}
	return response.json();
}

// Generic fetch helper for API calls
export async function apiFetch<T>(
	endpoint: string,
	options?: RequestInit,
): Promise<T> {
	const response = await fetch(`${API_BASE}${endpoint}`, {
		headers: {
			"Content-Type": "application/json",
			...options?.headers,
		},
		...options,
	});

	if (!response.ok) {
		throw new Error(`API error: ${response.status}`);
	}

	return response.json();
}
