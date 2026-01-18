import { AppShell } from "@shared/AppShell";
import { fetchHealth } from "@shared/api";
import "@shared/styles.css";
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

function HomePage() {
	const [health, setHealth] = useState<{
		ok: boolean;
		timestamp: string;
	} | null>(null);

	useEffect(() => {
		fetchHealth().then(setHealth).catch(console.error);
	}, []);

	return (
		<div>
			<h1>Vite + Hono MPA</h1>
			<p>
				A multi-page app with file-based routing and dynamic [param] segments.
			</p>

			<h2>API Health</h2>
			{health ? <p>✓ API OK - {health.timestamp}</p> : <p>Loading...</p>}

			<h2>Pages</h2>
			<ul>
				<li>
					<a href="/">Home</a>
				</li>
				<li>
					<a href="/admin/">Admin</a>
				</li>
				<li>
					<a href="/orders/">Orders</a>
				</li>
				<li>
					<a href="/orders/123/">Order #123</a> (dynamic route)
				</li>
			</ul>
		</div>
	);
}

createRoot(document.getElementById("root")!).render(
	<AppShell>
		<HomePage />
	</AppShell>,
);
