/**
 * In-memory data store. Stand-in for the SQLite layer until it exists.
 *
 * This file defines the data-access interface the routes depend on. The SQLite version
 * should export a function returning an object with the same methods, arguments, and
 * return shapes; then it can be swapped in from src/server.js without touching routes.
 *
 * All methods are async so the SQLite version can be sync or async underneath.
 * Data is lost when the server restarts.
 *
 * Shapes:
 *   User    { id, username, email, passwordHash, createdAt }
 *   Recipe  { id, authorId, title, description, prepMinutes, cookMinutes,
 *             parent: { recipeId, version } | null, createdAt, updatedAt }
 *   Version { version, ingredients: [{ quantity, unit, name }], steps: [string], createdAt }
 *
 * Title, description, and times live on the recipe; ingredients and steps live on a
 * version (FR-04). Versions are never modified once saved.
 */

import { ConflictError } from './errors.js';

const now = () => new Date().toISOString();
const copy = (value) => structuredClone(value);

export function createMemoryStore() {
  const users = [];
  const recipes = [];
  const versions = new Map(); // recipeId -> Version[] (index 0 is version 1)
  let nextUserId = 1;
  let nextRecipeId = 1;

  const findRecipe = (id) => recipes.find((r) => r.id === id);

  return {
    // ---- Users ----

    /**
     * Create a user. Usernames are unique case-insensitively; emails are stored lowercase.
     * @throws {ConflictError} if the username or email is taken
     */
    async createUser({ username, email, passwordHash }) {
      if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
        throw new ConflictError('username');
      }
      if (users.some((u) => u.email === email)) throw new ConflictError('email');
      const user = { id: nextUserId++, username, email, passwordHash, createdAt: now() };
      users.push(user);
      return copy(user);
    },

    async getUserById(id) {
      const user = users.find((u) => u.id === id);
      return user ? copy(user) : null;
    },

    /** Case-insensitive lookup, used by login. */
    async getUserByUsername(username) {
      const user = users.find((u) => u.username.toLowerCase() === username.toLowerCase());
      return user ? copy(user) : null;
    },

    // ---- Recipes ----

    /**
     * Create a recipe and its version 1. For a fork, pass parent: { recipeId, version }.
     * @returns {Promise<Recipe>}
     */
    async createRecipe({ authorId, title, description, prepMinutes, cookMinutes, parent = null, ingredients, steps }) {
      const timestamp = now();
      const recipe = {
        id: nextRecipeId++,
        authorId,
        title,
        description,
        prepMinutes,
        cookMinutes,
        parent: parent ? { recipeId: parent.recipeId, version: parent.version } : null,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      recipes.push(recipe);
      versions.set(recipe.id, [{ version: 1, ingredients: copy(ingredients), steps: copy(steps), createdAt: timestamp }]);
      return copy(recipe);
    },

    async getRecipe(id) {
      const recipe = findRecipe(id);
      return recipe ? copy(recipe) : null;
    },

    /** All recipes, newest first. */
    async listRecipes() {
      return copy(recipes).sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id - a.id);
    },

    /**
     * Update recipe-level fields (title, description, prepMinutes, cookMinutes) and bump
     * updatedAt. Does not create a version.
     */
    async updateRecipe(id, fields) {
      const recipe = findRecipe(id);
      if (!recipe) return null;
      for (const key of ['title', 'description', 'prepMinutes', 'cookMinutes']) {
        if (fields[key] !== undefined) recipe[key] = fields[key];
      }
      recipe.updatedAt = now();
      return copy(recipe);
    },

    // ---- Versions ----

    /** Save new ingredients/steps as the next version. Returns the new Version. */
    async addVersion(recipeId, { ingredients, steps }) {
      const list = versions.get(recipeId);
      if (!list) return null;
      const version = { version: list.length + 1, ingredients: copy(ingredients), steps: copy(steps), createdAt: now() };
      list.push(version);
      return copy(version);
    },

    /** A specific version, or the latest when versionNumber is omitted. Null if missing. */
    async getVersion(recipeId, versionNumber) {
      const list = versions.get(recipeId);
      if (!list) return null;
      const version = versionNumber === undefined ? list.at(-1) : list[versionNumber - 1];
      return version ? copy(version) : null;
    },

    /** Version summaries, oldest first: [{ version, createdAt }]. */
    async listVersions(recipeId) {
      return (versions.get(recipeId) ?? []).map(({ version, createdAt }) => ({ version, createdAt }));
    },

    // ---- Forks ----

    /** Direct forks of a recipe, oldest first. */
    async listForks(recipeId) {
      return copy(recipes.filter((r) => r.parent?.recipeId === recipeId));
    },

    async countForks(recipeId) {
      return recipes.filter((r) => r.parent?.recipeId === recipeId).length;
    },
  };
}
