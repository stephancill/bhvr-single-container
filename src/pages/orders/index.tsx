import { AppShell } from "@shared/AppShell";
import "@shared/styles.css";
import { createRoot } from "react-dom/client";

const ORDERS = [
	{ id: "123", customer: "Alice" },
	{ id: "124", customer: "Bob" },
	{ id: "125", customer: "Carol" },
];

function OrdersPage() {
	return (
		<div>
			<h1>Orders</h1>
			<ul>
				{ORDERS.map((order) => (
					<li key={order.id}>
						<a href={`/orders/${order.id}/`}>
							Order #{order.id} - {order.customer}
						</a>
					</li>
				))}
			</ul>
		</div>
	);
}

createRoot(document.getElementById("root")!).render(
	<AppShell>
		<OrdersPage />
	</AppShell>,
);
