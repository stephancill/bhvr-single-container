import { AppShell } from "@shared/AppShell";
import "@shared/styles.css";
import { createRoot } from "react-dom/client";

function AdminPage() {
	return (
		<div>
			<h1>Admin</h1>
			<p>This is the admin page.</p>
		</div>
	);
}

createRoot(document.getElementById("root")!).render(
	<AppShell>
		<AdminPage />
	</AppShell>,
);
