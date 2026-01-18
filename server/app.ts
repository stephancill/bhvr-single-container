import { Hono } from "hono";
import { logger } from "hono/logger";

const app = new Hono();

// Logger middleware
app.use("*", logger());

// API routes
app.get("/api/health", (c) => {
	return c.json({ ok: true, timestamp: new Date().toISOString() });
});

// Add more API routes here...

export default app;
