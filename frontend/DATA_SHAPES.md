# Frontend data shapes (Milestone 1)

Agreed starting contract for the React client. Confirm with Dan before backend implementation; keep `src/data/shapes.js` in sync with any changes.

## Shared records

| Shape | Fields |
| --- | --- |
| `UserSummary` | `id`, `username` |
| `Ingredient` | `quantity` (positive number), `unit`, `name` |
| `Step` | `order` (1-based), `instruction` |
| `RecipeVersionSummary` | `versionNumber`, `savedAt` (ISO 8601) |
| `ParentReference` | `recipeId`, `versionNumber`, `title` |

## API-facing shapes

| Use | Shape |
| --- | --- |
| Browse list item | `id`, `title`, `author`, `forkCount`, `createdAt` |
| Recipe detail | list fields + `description`, `prepTimeMinutes`, `cookTimeMinutes`, `versionNumber`, `versions`, `ingredients`, `steps`, `parent`, `forkCount` |
| Publish payload | `title`, `description`, `prepTimeMinutes`, `cookTimeMinutes`, `ingredients`, `steps` |
| Diff | `ingredientsAdded`, `ingredientsRemoved`, `ingredientsChanged`, `stepsAdded`, `stepsChanged` |
| Lineage | `ancestors` (nearest parent first), `current`, `directForks` |

## Response envelope (proposed)

```json
{ "ok": true, "data": {} }
```

```json
{ "ok": false, "error": { "code": "VALIDATION_ERROR", "message": "..." } }
```

## Mock data

`src/data/mockRecipes.js` includes originals, first-generation forks, a second-generation fork, and helpers for browse / detail / lineage / diff so the UI can run without the API.
