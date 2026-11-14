# Swap Chef — Development TODO

**Team responsibilities:** Emma — frontend; Dan — backend; Aman — database; Mark — cross-stack integration and testing. Everyone contributes to comparison and lineage features and reviews another person's code.

## Milestone 1 — Repository, scaffolding, schema, API contract
**Goal:** Everyone can run the application locally.

- [x] **All:** Create shared GitHub repository and agree on branch/PR review workflow.
- [x] **Emma:** Scaffold React + Vite frontend and basic CSS layout.
- [x] **Dan:** Scaffold Node.js + Express server and basic API response conventions.
  - Merged via PR #1 (`backend/`, sessions, validation, route stubs).
- [ ] **Aman:** Set up SQLite database and initial schema for users, recipes, versions, ingredients, steps, and fork relationships.
- [x] **Dan + Aman:** Define API requests/responses, validation rules, and parent-version references.
  - Contract in `docs/API.md` + `docs/mock/recipes.json` (+ Zod schemas in `backend/src/schemas.js`). Aman still owns SQLite persistence.
- [x] **Emma + Dan:** Agree on frontend data shapes and create mock recipe data.
  - Frontend shapes aligned to `docs/API.md` in `frontend/src/data/` and `frontend/DATA_SHAPES.md`.
- [ ] **Mark:** Verify local setup instructions and test frontend/backend/database integration.
- [x] **All:** Document installation, run commands, and any API/schema decisions.
  - Root `README.md`, `docs/API.md`, frontend + backend run instructions.
- [ ] **All:** Confirm the complete app can run locally.
  - Frontend + backend scaffolds run; full auth/persist stack waits on remaining M2 backend/DB work.

## Milestone 2 — Authentication, publishing, browse page
**Goal:** Users can register, log in, publish recipes, and browse published recipes.

- [ ] **Aman:** Implement user, recipe, version, ingredient, and step persistence.
- [ ] **Dan:** Implement registration, password hashing, login, logout, and sessions.
  - Logout + `/auth/me` exist; register/login still return `501` until persistence is wired.
- [ ] **Dan:** Enforce authenticated publishing and validate recipe inputs.
  - Auth gate + Zod validation present; publish handler still `501`.
- [ ] **Dan:** Implement publish-recipe and list-recipes routes.
- [x] **Emma:** Build registration and login forms.
  - Working forms with client validation, API error display, session-aware nav (`frontend/src/pages/LoginPage.jsx`, `RegisterPage.jsx`, `auth/AuthContext.jsx`).
- [x] **Emma:** Build recipe creation form with ingredient quantities/units and ordered steps.
  - Dynamic ingredient/step rows; units match backend allow-list; requires login; posts `POST /api/recipes`.
- [x] **Emma:** Build newest-first browse page with title, author, and fork count.
  - Loads `GET /api/recipes` via Vite proxy; falls back to mock data when API is down/`501`.
- [ ] **Mark:** Test auth, publishing, validation, database persistence, and UI/API integration.
- [ ] **All:** Demo registration → login → publish → browse locally.
  - Blocked until Dan/Aman finish M2 API + persistence; Emma UI is ready to call those endpoints.

## Milestone 3 — Recipe detail, forking, editing, version history
**Goal:** Users can view recipes, fork a specific version, edit forks, and retain earlier versions.

- [ ] **Aman:** Implement exact parent-version links and version creation/retrieval.
- [ ] **Dan:** Implement recipe-detail and fork routes.
  - Routes stubbed (`GET /recipes/:id`, `POST /recipes/:id/forks`); still return `501`.
- [ ] **Dan:** Implement edit/save logic that preserves previous ingredient/step versions.
  - `PUT /recipes/:id` validates and requires auth; handler still `501`.
- [x] **Emma:** Build recipe detail page with author, times, ingredients, steps, version, and parent link.
  - Loads `GET /api/recipes/:id` (optional `?version=`), falls back to mock data.
- [x] **Emma:** Add Fork action for logged-in users and login prompt for guests.
  - Fork button + guest login/register prompt; calls `POST /api/recipes/:id/forks` (mock draft fallback when API is unavailable).
- [x] **Emma:** Reuse editor for new recipes and forked recipes.
  - Same `RecipeEditorPage` for `/recipes/new`, fork drafts, and `/recipes/:id/edit` (publish vs save / new version).
- [x] **Emma + Dan:** Show version history on the recipe detail page.
  - Emma: selectable version history UI. Dan: serve version list / `?version=` from the API when persistence is ready.
- [ ] **Mark:** Test fork ownership, exact source-version references, repeat edits, and unchanged parent recipes.
- [ ] **All:** Demo original recipe → fork → edit → saved new version.
  - Blocked on Dan/Aman M3 API + persistence; Emma UI is ready.

## Milestone 4 — Diff engine and family tree
**Goal:** Automatically display recipe differences and lineage.

- [ ] **Dan + Aman:** Implement ingredient comparison (added, removed, changed quantities/units).
- [ ] **Dan + Aman:** Implement ingredient-name normalization and conservative unmatched-item handling.
- [ ] **Dan:** Implement ordered step comparison and structured diff response.
- [ ] **Aman + Dan:** Implement ancestor traversal and direct-child fork lookup.
- [ ] **Emma:** Build read-only comparison view.
- [ ] **Emma:** Build read-only family-tree view with clickable recipe nodes.
- [ ] **Mark + All:** Add predefined before/after comparison test cases.
- [ ] **Mark:** Test multi-generation forks, original recipes without parents, and direct forks.
- [ ] **All:** Use simpler changed-line reporting if advanced matching proves unreliable.
- [ ] **All:** Demo diff and lineage across multiple generations.

## Milestone 5 — Testing, bug fixes, polish, MVP demo
**Goal:** Stable, runnable MVP and demonstration.

- [ ] **Mark:** Coordinate end-to-end regression testing across all features.
- [ ] **Dan:** Review authentication, validation, and server error handling.
- [ ] **Aman:** Verify persistence, database relationships, and version integrity.
- [ ] **Emma:** Polish page layouts, forms, loading/error states, and navigation.
- [ ] **All:** Fix integration bugs and review outstanding pull requests.
- [ ] **All:** Verify guest browsing and authenticated publishing/forking.
- [ ] **All:** Verify automatic diffs and recipe lineage against sample data.
- [ ] **All:** Update README with setup instructions and demo steps.
- [ ] **All:** Rehearse MVP demonstration and confirm local startup works.

## Optional backlog — only after MVP
- [ ] Search by recipe name, ingredient, or dietary tag.
- [ ] Printable PDF recipe export.
- [ ] Recipe image upload and display.

## Ongoing team practices
- [ ] Keep each feature on its own branch and merge via reviewed pull request.
- [ ] Have each team member review another team member's code.
- [ ] Review and understand any AI-generated code before merging.
- [ ] Announce API or schema changes before implementing them.
- [ ] Merge small changes frequently.
- [ ] Keep the app runnable at the end of every milestone.

## Definition of done (for each feature)
- [ ] Implements the relevant item in `requirements.md`.
- [ ] Uses the agreed API/data schema.
- [ ] Has appropriate validation and error handling.
- [ ] Has been tested, including key edge cases.
- [ ] Has been reviewed and merged into the shared repository.
