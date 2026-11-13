# Swap Chef

Web app for publishing, forking, and comparing recipes while preserving version lineage.

See [`requirements.md`](requirements.md) and [`TODO.md`](TODO.md).

## Stack

- **Frontend:** React + Vite + CSS (`frontend/`)
- **Backend:** Node.js + Express (`backend/`)
- **Database:** SQLite (`db/`)

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

Vite proxies `/api` to `http://localhost:3000`. Browse calls the live API and falls back to mock data if the backend is down or still returning `501`. Auth + publish forms post to the API with cookies (`credentials: 'include'`).

Data shapes: `frontend/src/data/shapes.js`, `frontend/DATA_SHAPES.md` (aligned with `docs/API.md`).

### Pages

| Route | Purpose |
| --- | --- |
| `/` | Browse recipes (newest first; title, author, fork count) |
| `/recipes/:id` | Recipe detail (mock until M3 API wiring) |
| `/recipes/new` | Publish recipe (auth required) |
| `/recipes/:id/edit` | Editor shell (full edit flow in M3) |
| `/login`, `/register` | Working auth forms |
| `/recipes/:id/compare` | Read-only comparison (mock) |
| `/recipes/:id/lineage` | Family-tree view (mock) |

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

## Project docs

- `requirements.md` — MVP requirements
- `TODO.md` — milestone task breakdown
