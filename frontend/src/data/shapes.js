/**
 * Frontend data shapes for Swap Chef (Milestone 1 — Emma + Dan agreement).
 * These mirror the logical records in requirements.md and the suggested API contract.
 * Dan should confirm before backend implementation; adjust here if the API contract changes.
 */

/** Units accepted for ingredient quantities (proposed; confirm with Dan/Aman). */
export const INGREDIENT_UNITS = [
  'tsp',
  'tbsp',
  'cup',
  'fl oz',
  'ml',
  'l',
  'g',
  'kg',
  'oz',
  'lb',
  'pinch',
  'clove',
  'piece',
  'slice',
  'sprig',
  'can',
  'whole',
  'to taste',
]

/**
 * @typedef {Object} UserSummary
 * @property {number} id
 * @property {string} username
 */

/**
 * @typedef {Object} Ingredient
 * @property {number} quantity - Must be positive (except when unit is "to taste")
 * @property {string} unit - One of INGREDIENT_UNITS
 * @property {string} name - Nonempty ingredient name
 */

/**
 * @typedef {Object} Step
 * @property {number} order - 1-based position in the sequence
 * @property {string} instruction - Nonempty step text
 */

/**
 * @typedef {Object} RecipeVersionSummary
 * @property {number} versionNumber
 * @property {string} savedAt - ISO 8601 datetime
 */

/**
 * @typedef {Object} ParentReference
 * @property {number} recipeId
 * @property {number} versionNumber - Exact parent version that was forked
 * @property {string} title
 */

/**
 * Browse-list recipe (GET /api/recipes item).
 * @typedef {Object} RecipeListItem
 * @property {number} id
 * @property {string} title
 * @property {UserSummary} author
 * @property {number} forkCount
 * @property {string} createdAt - ISO 8601 datetime
 */

/**
 * Full recipe detail (GET /api/recipes/:id).
 * @typedef {Object} RecipeDetail
 * @property {number} id
 * @property {string} title
 * @property {string} description
 * @property {number} prepTimeMinutes
 * @property {number} cookTimeMinutes
 * @property {UserSummary} author
 * @property {number} versionNumber - Currently displayed version
 * @property {RecipeVersionSummary[]} versions
 * @property {Ingredient[]} ingredients
 * @property {Step[]} steps
 * @property {ParentReference|null} parent
 * @property {number} forkCount
 * @property {string} createdAt
 */

/**
 * Payload for publishing a new recipe (POST /api/recipes).
 * @typedef {Object} PublishRecipePayload
 * @property {string} title
 * @property {string} description
 * @property {number} prepTimeMinutes
 * @property {number} cookTimeMinutes
 * @property {Ingredient[]} ingredients
 * @property {Step[]} steps
 */

/**
 * Payload for saving edits (PUT /api/recipes/:id).
 * Title/times update the recipe record; ingredient/step changes create a new version.
 * @typedef {Object} UpdateRecipePayload
 * @property {string} [title]
 * @property {string} [description]
 * @property {number} [prepTimeMinutes]
 * @property {number} [cookTimeMinutes]
 * @property {Ingredient[]} [ingredients]
 * @property {Step[]} [steps]
 */

/**
 * Diff result (GET /api/recipes/:id/diff) — fork vs its parent version.
 * @typedef {Object} IngredientChange
 * @property {Ingredient} before
 * @property {Ingredient} after
 *
 * @typedef {Object} StepChange
 * @property {number} order
 * @property {string} before
 * @property {string} after
 *
 * @typedef {Object} RecipeDiff
 * @property {Ingredient[]} ingredientsAdded
 * @property {Ingredient[]} ingredientsRemoved
 * @property {IngredientChange[]} ingredientsChanged
 * @property {Step[]} stepsAdded
 * @property {StepChange[]} stepsChanged
 */

/**
 * Lineage / family tree (GET /api/recipes/:id/lineage).
 * @typedef {Object} LineageNode
 * @property {number} id
 * @property {string} title
 * @property {UserSummary} author
 * @property {number} versionNumber
 *
 * @typedef {Object} RecipeLineage
 * @property {LineageNode[]} ancestors - Parent chain toward the original (nearest parent first)
 * @property {LineageNode} current
 * @property {LineageNode[]} directForks - Immediate children only
 */

/**
 * Standard API envelope (proposed — confirm with Dan).
 * Success: { ok: true, data: T }
 * Error:   { ok: false, error: { code: string, message: string, details?: unknown } }
 */

export const API_ENDPOINTS = {
  register: 'POST /api/auth/register',
  login: 'POST /api/auth/login',
  logout: 'POST /api/auth/logout',
  listRecipes: 'GET /api/recipes',
  publishRecipe: 'POST /api/recipes',
  getRecipe: 'GET /api/recipes/:id',
  forkRecipe: 'POST /api/recipes/:id/forks',
  updateRecipe: 'PUT /api/recipes/:id',
  compareRecipe: 'GET /api/recipes/:id/diff',
  recipeLineage: 'GET /api/recipes/:id/lineage',
}
