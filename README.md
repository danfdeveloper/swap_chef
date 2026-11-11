# Swap Chef

Web app for publishing, forking, and comparing recipes while preserving version lineage.

## Stack

- **Frontend:** React + Vite + CSS (`frontend/`)
- **Backend:** Node.js + Express (`backend/`)
- **Database:** SQLite (`db/`)

## How to launch

```bash
cd frontend
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

The UI currently uses mock recipe data from `frontend/src/data/mockRecipes.js`. Data shapes for API agreement live in `frontend/src/data/shapes.js` and `frontend/DATA_SHAPES.md`.

### Pages scaffolded

| Route | Purpose |
| --- | --- |
| `/` | Browse recipes (newest first) |
| `/recipes/:id` | Recipe detail |
| `/recipes/new`, `/recipes/:id/edit` | Recipe editor layout |
| `/login`, `/register` | Auth form scaffolds |
| `/recipes/:id/compare` | Read-only comparison (mock) |
| `/recipes/:id/lineage` | Family-tree view (mock) |

## Project docs

- `requirements.md` — MVP requirements
- `TODO.md` — milestone task breakdown
