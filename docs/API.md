# Swap Chef API Contract

**Status:** Milestone 1 draft for team review. Owner: Dan (backend). Endpoint paths follow the
suggested table in `requirements.md` §4. Anything marked *proposal* still needs sign-off.

Base URL (local): `http://localhost:3000/api`

Mock responses for every endpoint below: [`docs/mock/recipes.json`](mock/recipes.json)
(keyed by `"METHOD /path"`). The backend test suite checks that the mock recipes pass the
real validation rules, so the mock data stays in sync with the backend.

## Response conventions

- All request and response bodies are JSON.
- **Success:** the resource is returned under a named key: `{ "user": … }`, `{ "recipe": … }`,
  `{ "recipes": [ … ] }`, `{ "diff": … }`, `{ "lineage": … }`. A `204` has no body.
- **Errors** always have this shape. `details` appears only on validation errors (`400`):
  ```json
  { "error": { "message": "Validation failed", "details": [{ "field": "ingredients.0.quantity", "message": "Too small: expected number to be >0" }] } }
  ```
  `field` is a dot path into the request body, so the UI can show each message next to its input.
- **Timestamps:** ISO 8601 strings in UTC (`"2026-11-10T16:00:00.000Z"`).
- **IDs:** integers.
- **Times:** whole minutes (`prepMinutes`, `cookMinutes`).

| Status | Meaning |
| --- | --- |
| 200 / 201 / 204 | OK / created / OK with no body |
| 400 | Invalid JSON or failed validation |
| 401 | Not logged in (protected route) |
| 403 | Logged in but not allowed (e.g. editing someone else's recipe) |
| 404 | Recipe or route not found |
| 409 | Conflict (username or email already taken) |
| 500 | Unexpected server error (details are logged on the server, never sent) |
| 501 | Endpoint not built yet (Milestone 1 stubs) |

## Authentication and sessions

- Cookie-based sessions. The session cookie is `swapchef.sid` (httpOnly, sameSite=lax, 7-day expiry).
- The frontend must send cookies with every request: `fetch(url, { credentials: 'include' })`.
- CORS allows `http://localhost:5173` (the Vite default). This can be changed with `CORS_ORIGIN` in `backend/.env`.
- Sessions are stored in memory for now and reset when the server restarts. A persistent
  store will be added once the SQLite layer exists.

## Validation rules

**Register:** `username` 3–30 characters (letters, numbers, `_`); `email` must be a valid address and is
stored lowercase; `password` 8–72 characters.

**Recipe (publish):**

| Field | Rule |
| --- | --- |
| `title` | required, 1–120 characters, trimmed |
| `description` | optional, ≤ 2000 characters, defaults to `""` |
| `prepMinutes`, `cookMinutes` | required whole numbers, 0–10080 |
| `ingredients` | 1–100 items, order preserved |
| `ingredients[].quantity` | required number > 0 (decimals allowed, e.g. `0.75`) |
| `ingredients[].unit` | one of the allowed units, case-insensitive, stored lowercase; `null` for counted items ("2 eggs") |
| `ingredients[].name` | required, 1–100 characters |
| `steps` | 1–100 non-empty strings, order preserved |

**Allowed units** (*proposal*, defined in `backend/src/schemas.js`):
`tsp, tbsp, cup, fl oz, ml, l, oz, lb, g, kg, pinch, dash, clove, slice, can, stick, package`

**Recipe (edit):** any subset of the publish fields, with at least one field present. Unknown fields
are rejected.

## Shared shapes

**User**
```json
{ "id": 1, "username": "chef_dan" }
```

**Recipe** (response)
```json
{
  "id": 7,
  "title": "Brown Butter Cookies",
  "description": "Nutty brown butter and a longer, lower bake.",
  "prepMinutes": 25,
  "cookMinutes": 12,
  "author": { "id": 1, "username": "chef_dan" },
  "parent": { "recipeId": 3, "version": 2, "title": "Classic Chocolate Chip Cookies" },
  "forkCount": 1,
  "version": 1,
  "versions": [{ "version": 1, "createdAt": "2026-11-08T15:00:00.000Z" }],
  "ingredients": [{ "quantity": 1, "unit": "cup", "name": "butter, browned" }],
  "steps": ["Preheat oven to 350°F.", "…"],
  "createdAt": "2026-11-08T15:00:00.000Z",
  "updatedAt": "2026-11-08T15:00:00.000Z"
}
```

- `parent` is `null` for an original recipe.
- `version` is the version whose ingredients and steps are being returned. `versions` lists every saved version.

## Versioning and parent-version references (FR-04)

Per `requirements.md`:

- **Title, description, and times** live on the recipe record. Editing them updates the recipe directly, with no new version.
- **Ingredients and steps** live on a version. Publishing creates version 1. Any edit that changes ingredients or steps
  saves a new version (`version + 1`), and earlier versions are never modified.
- **A fork** is a new recipe owned by the user who forked it. It starts at version 1 with a copy of the parent's
  ingredients and steps, and stores a reference to the **exact parent recipe and version** it was copied from
  (`parent.recipeId` + `parent.version`). That reference never changes, even if the parent gets newer versions later.
- Only the recipe's author can edit it (`403` otherwise). Forking never changes the parent.

What the backend needs from the database layer (Dan + Aman to finalize):

- Look up a recipe together with a chosen version's ingredients and steps (in order).
- Save a new version for a recipe.
- Create a fork row that records the parent recipe ID and the parent version.
- Get a recipe's parent reference, and get the direct children of a recipe (for `/lineage` and `forkCount`).

## Endpoints

| Method | Path | Auth | Request body | Success response |
| --- | --- | --- | --- | --- |
| GET | `/health` | – | – | `200 { status: "ok" }` |
| POST | `/auth/register` | – | `{ username, email, password }` | `201 { user }`, user is logged in. `409` if taken |
| POST | `/auth/login` | – | `{ username, password }` | `200 { user }`. `401` on bad credentials |
| POST | `/auth/logout` | – | – | `204` |
| GET | `/auth/me` | – | – | `200 { user }`, or `401` if not logged in |
| GET | `/recipes` | – | – | `200 { recipes: [{ id, title, author, forkCount, createdAt }] }`, newest first |
| GET | `/recipes/:id` | – | – | `200 { recipe }` at the latest version. `?version=N` returns an older version. `404` if missing |
| POST | `/recipes` | ✔ | Recipe (publish) | `201 { recipe }` at version 1 |
| POST | `/recipes/:id/forks` | ✔ | – | `201 { recipe }`, the new fork with `parent` set. The frontend then opens it in the editor |
| PUT | `/recipes/:id` | ✔ author | Recipe (edit) | `200 { recipe }`. New version only if ingredients or steps changed |
| GET | `/recipes/:id/diff` | – | – | `200 { diff }`. `400` if the recipe is not a fork |
| GET | `/recipes/:id/lineage` | – | – | `200 { lineage }` |

Milestone 1 status: `/health`, `/auth/logout`, and `/auth/me` work. All other routes already
check input and login, then return `501` until they're built (Milestones 2–4).

### Diff

Compares the recipe's latest version with the parent version it was forked from.

```json
{
  "diff": {
    "from": { "recipeId": 3, "version": 2, "title": "Classic Chocolate Chip Cookies" },
    "to": { "recipeId": 7, "version": 1, "title": "Brown Butter Cookies" },
    "fields": [{ "field": "cookMinutes", "from": 10, "to": 12 }],
    "ingredients": {
      "added":   [{ "quantity": 0.75, "unit": "cup", "name": "brown sugar" }],
      "removed": [{ "quantity": 0.75, "unit": "cup", "name": "sugar" }],
      "changed": [{ "from": { "quantity": 1, "unit": "cup", "name": "butter, softened" },
                    "to":   { "quantity": 1, "unit": "cup", "name": "butter, browned" } }]
    },
    "steps": {
      "added":   [{ "position": 2, "text": "Brown the butter…" }],
      "removed": [],
      "changed": [{ "position": 1, "from": "Preheat oven to 375°F.", "to": "Preheat oven to 350°F." }]
    }
  }
}
```

- `fields` lists changes to title, description, `prepMinutes`, and `cookMinutes`.
- Step `position` is 1-based. Positions in `added` and `changed` refer to the fork. Positions in `removed` refer to the parent.
- Ingredients count as "changed" when their normalized names match. If an ingredient can't be matched
  confidently, it's reported as one removal plus one addition (FR-05). The matching rules will be finalized in Milestone 4.

### Lineage

```json
{
  "lineage": {
    "ancestors": [
      { "id": 1, "title": "Grandma's Chocolate Chip Cookies", "author": { "id": 5, "username": "nana" }, "version": 1 },
      { "id": 3, "title": "Classic Chocolate Chip Cookies", "author": { "id": 2, "username": "sam" }, "version": 2 }
    ],
    "current": { "id": 7, "title": "Brown Butter Cookies", "author": { "id": 1, "username": "chef_dan" } },
    "forks": [{ "id": 9, "title": "Vegan Brown Butter Cookies", "author": { "id": 4, "username": "lee" } }]
  }
}
```

- `ancestors` is ordered from the original recipe down to the direct parent, and is empty for an original.
- Each ancestor's `version` is the version that its child was forked from.
- `forks` lists the direct forks only.
- Every node has an `id`, which the frontend uses to link to `/recipes/:id`.

## Open questions for the team

1. Allowed unit list. Are there units to add or remove? (Emma's editor dropdown should use the same list.)
2. Should `GET /recipes` also return `description` or times for the browse cards?
3. Session store once SQLite is ready, for example `connect-sqlite3` or a sessions table owned by Aman's schema.
