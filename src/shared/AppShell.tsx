import type { ReactNode } from "react";

interface AppShellProps {
	children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
	return (
		<>
			<nav>
				<a href="/">Home</a> | <a href="/admin/">Admin</a> |{" "}
				<a href="/orders/">Orders</a>
			</nav>
			<main>{children}</main>
		</>
	);
}
