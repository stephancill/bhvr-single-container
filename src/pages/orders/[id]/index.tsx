import { AppShell } from "@shared/AppShell";
import { getParam } from "@shared/types";
import "@shared/styles.css";
import { createRoot } from "react-dom/client";

function OrderDetailPage() {
	const orderId = getParam("id") ?? "unknown";

	return (
		<div>
			<p>
				<a href="/orders/">← Back to Orders</a>
			</p>
			<h1>Order #{orderId}</h1>
			<p>
				This page demonstrates dynamic <code>[id]</code> routing.
			</p>
			<pre>window.__PARAMS__ = {JSON.stringify({ id: orderId }, null, 2)}</pre>
		</div>
	);
}

createRoot(document.getElementById("root")!).render(
	<AppShell>
		<OrderDetailPage />
	</AppShell>,
);
