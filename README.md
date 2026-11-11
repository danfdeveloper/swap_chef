# swap_chef

Swap Chef: share, fork, and compare recipes. See [`requirements.md`](requirements.md) and [`TODO.md`](TODO.md).

## Backend (Node.js + Express)

Requires Node.js 20.12 or newer (`node -v`).

```bash
cd backend
npm install
cp .env.example .env   # optional; defaults work for local dev
npm run dev            # starts on http://localhost:3000, restarts on file changes
npm test               # runs the API and validation tests
```

Check it's running: open http://localhost:3000/api/health, which should return `{"status":"ok"}`.

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `3000` | API port |
| `SESSION_SECRET` | dev-only value | Signs session cookies (required in production) |
| `CORS_ORIGIN` | `http://localhost:5173` | Frontend origin allowed to call the API with cookies |

- **API contract:** [`docs/API.md`](docs/API.md)
- **Mock responses for frontend work:** [`docs/mock/recipes.json`](docs/mock/recipes.json)

### Backend layout

```
backend/
  src/
    server.js            starts the HTTP server
    app.js               builds the Express app (JSON, CORS, sessions, routes, errors)
    config.js            reads .env / environment variables
    schemas.js           validation rules (zod) and allowed units
    middleware/
      errors.js          HttpError, 404 handler, JSON error handler
      requireAuth.js     blocks protected routes when not logged in
      validate.js        validates request bodies against a schema
    routes/
      auth.js            /api/auth/*
      recipes.js         /api/recipes/*
  test/                  node:test + supertest
```
