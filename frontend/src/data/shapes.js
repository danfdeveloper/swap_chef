/**
 * Frontend data shapes aligned with docs/API.md (Dan's Milestone 1 contract).
 */

/** Allowed units from backend/src/schemas.js — keep in sync with Dan. */
export const INGREDIENT_UNITS = [
  'tsp',
  'tbsp',
  'cup',
  'fl oz',
  'ml',
  'l',
  'oz',
  'lb',
  'g',
  'kg',
  'pinch',
  'dash',
  'clove',
  'slice',
  'can',
  'stick',
  'package',
]

/**
 * @typedef {Object} UserSummary
 * @property {number} id
 * @property {string} username
 */

/**
 * @typedef {Object} Ingredient
 * @property {number} quantity - Must be > 0
 * @property {string|null} unit - One of INGREDIENT_UNITS, or null for counted items
 * @property {string} name
 */

/**
 * @typedef {Object} RecipeVersionSummary
 * @property {number} version
 * @property {string} createdAt
 */

/**
 * @typedef {Object} ParentReference
 * @property {number} recipeId
 * @property {number} version
 * @property {string} title
 */

/**
 * @typedef {Object} RecipeListItem
 * @property {number} id
 * @property {string} title
 * @property {UserSummary} author
 * @property {number} forkCount
 * @property {string} createdAt
 */

/**
 * @typedef {Object} RecipeDetail
 * @property {number} id
 * @property {string} title
 * @property {string} description
 * @property {number} prepMinutes
 * @property {number} cookMinutes
 * @property {UserSummary} author
 * @property {ParentReference|null} parent
 * @property {number} forkCount
 * @property {number} version
 * @property {RecipeVersionSummary[]} versions
 * @property {Ingredient[]} ingredients
 * @property {string[]} steps
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} PublishRecipePayload
 * @property {string} title
 * @property {string} [description]
 * @property {number} prepMinutes
 * @property {number} cookMinutes
 * @property {Ingredient[]} ingredients
 * @property {string[]} steps
 */

export const API_ENDPOINTS = {
  me: 'GET /api/auth/me',
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
