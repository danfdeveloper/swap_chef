# Swap Chef — Development TODO

**Team responsibilities:** Emma — frontend; Dan — backend; Aman — database; Mark — cross-stack integration and testing. Everyone contributes to comparison and lineage features and reviews another person's code.

## Milestone 1 — Repository, scaffolding, schema, API contract
**Goal:** Everyone can run the application locally.

- [ ] **All:** Create shared GitHub repository and agree on branch/PR review workflow.
- [x] **Emma:** Scaffold React + Vite frontend and basic CSS layout.
- [ ] **Dan:** Scaffold Node.js + Express server and basic API response conventions.
- [ ] **Aman:** Set up SQLite database and initial schema for users, recipes, versions, ingredients, steps, and fork relationships.
- [ ] **Dan + Aman:** Define API requests/responses, validation rules, and parent-version references.
- [x] **Emma + Dan:** Agree on frontend data shapes and create mock recipe data.
  - Emma: shapes + mock data in `frontend/src/data/` and `frontend/DATA_SHAPES.md` (Dan still to confirm).
- [ ] **Mark:** Verify local setup instructions and test frontend/backend/database integration.
- [ ] **All:** Document installation, run commands, and any API/schema decisions.
- [ ] **All:** Confirm the complete app can run locally.

## Milestone 2 — Authentication, publishing, browse page
**Goal:** Users can register, log in, publish recipes, and browse published recipes.

- [ ] **Aman:** Implement user, recipe, version, ingredient, and step persistence.
- [ ] **Dan:** Implement registration, password hashing, login, logout, and sessions.
- [ ] **Dan:** Enforce authenticated publishing and validate recipe inputs.
- [ ] **Dan:** Implement publish-recipe and list-recipes routes.
- [ ] **Emma:** Build registration and login forms.
- [ ] **Emma:** Build recipe creation form with ingredient quantities/units and ordered steps.
- [ ] **Emma:** Build newest-first browse page with title, author, and fork count.
- [ ] **Mark:** Test auth, publishing, validation, database persistence, and UI/API integration.
- [ ] **All:** Demo registration → login → publish → browse locally.

## Milestone 3 — Recipe detail, forking, editing, version history
**Goal:** Users can view recipes, fork a specific version, edit forks, and retain earlier versions.

- [ ] **Aman:** Implement exact parent-version links and version creation/retrieval.
- [ ] **Dan:** Implement recipe-detail and fork routes.
- [ ] **Dan:** Implement edit/save logic that preserves previous ingredient/step versions.
- [ ] **Emma:** Build recipe detail page with author, times, ingredients, steps, version, and parent link.
- [ ] **Emma:** Add Fork action for logged-in users and login prompt for guests.
- [ ] **Emma:** Reuse editor for new recipes and forked recipes.
- [ ] **Emma + Dan:** Show version history on the recipe detail page.
- [ ] **Mark:** Test fork ownership, exact source-version references, repeat edits, and unchanged parent recipes.
- [ ] **All:** Demo original recipe → fork → edit → saved new version.

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
