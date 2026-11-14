# Frontend data shapes

Aligned with [`docs/API.md`](../docs/API.md) (Dan's Milestone 1 contract). Source of truth in code: `src/data/shapes.js`.

## Shared records

| Shape | Fields |
| --- | --- |
| `UserSummary` | `id`, `username` |
| `Ingredient` | `quantity` (> 0), `unit` (allowed unit or `null`), `name` |
| `RecipeVersionSummary` | `version`, `createdAt` |
| `ParentReference` | `recipeId`, `version`, `title` |

## API-facing shapes

| Use | Shape |
| --- | --- |
| Browse list item | `id`, `title`, `author`, `forkCount`, `createdAt` |
| Recipe detail | + `description`, `prepMinutes`, `cookMinutes`, `version`, `versions`, `ingredients`, `steps` (string[]), `parent`, `updatedAt` |
| Publish payload | `title`, `description`, `prepMinutes`, `cookMinutes`, `ingredients`, `steps` |

## Errors

```json
{ "error": { "message": "Validation failed", "details": [{ "field": "ingredients.0.quantity", "message": "..." }] } }
```

## Units

Same list as `backend/src/schemas.js`:
`tsp, tbsp, cup, fl oz, ml, l, oz, lb, g, kg, pinch, dash, clove, slice, can, stick, package` (+ `null` for counted items).

## Mock fallback

`src/data/mockRecipes.js` is used when browse/detail APIs are unavailable (network error or `501`).
