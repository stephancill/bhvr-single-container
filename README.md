# Vite + Hono + React MPA Template

A single-process web application template featuring:

- **Multi-page React app** with file-based routing
- **Dynamic `[param]` routes** (e.g., `/orders/[id]`)
- **Hono API** at `/api/*`
- **Vite HMR** in development
- **Bun runtime** in production

## Quick Start

```bash
bun install
bun run dev      # Development (Vite + HMR on :5173)
bun run build    # Production build
bun run start    # Production server (Bun on :3000)
```

## Project Structure

```
├── src/
│   ├── pages/                    # File-based routing
│   │   ├── index.html            # Base template (required)
│   │   ├── index.tsx             # Home page (/)
│   │   ├── admin/
│   │   │   └── index.tsx         # /admin (uses root template)
│   │   └── orders/
│   │       ├── index.tsx         # /orders
│   │       └── [id]/
│   │           └── index.tsx     # /orders/:id (dynamic route)
│   └── shared/
│       ├── AppShell.tsx
│       ├── api.ts
│       └── types.ts
├── server/
│   ├── app.ts                    # Hono API routes
│   ├── index.ts                  # Production server
│   └── resolvePage.ts            # Dynamic route resolver
└── vite.config.ts
```

## Adding a New Page

Just create an `index.tsx` file:

```
src/pages/dashboard/index.tsx    →  /dashboard
src/pages/users/[id]/index.tsx   →  /users/:id
```

That's it! No `index.html` needed (falls back to root template).

### Optional: Custom HTML Template

Add `index.html` only when you need custom `<title>`, meta tags, etc:

```html
<!-- src/pages/dashboard/index.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Dashboard | My App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./index.tsx"></script>
  </body>
</html>
```

## Dynamic Routes

Use brackets for URL parameters:

```
src/pages/users/[userId]/posts/[postId]/index.tsx
```

Access params in your component:

```tsx
import { getParam } from "@shared/types";

function PostPage() {
  const userId = getParam("userId");
  const postId = getParam("postId");
  return <h1>User {userId}, Post {postId}</h1>;
}
```

## API Routes

Define in `server/app.ts`:

```ts
app.get("/api/users", (c) => c.json([...]));
app.post("/api/users", async (c) => {
  const body = await c.req.json();
  // ...
});
```

## Scripts

| Script | Description |
|--------|-------------|
| `dev` | Vite dev server with HMR |
| `build` | Production build |
| `start` | Production server (Bun) |
| `check` | Lint & format (Biome) |
| `typecheck` | TypeScript checks |

## Tech Stack

- [Bun](https://bun.sh) - Runtime
- [Vite](https://vite.dev) - Bundler (MPA mode)
- [React](https://react.dev) - UI
- [Hono](https://hono.dev) - API
- [Biome](https://biomejs.dev) - Linting
