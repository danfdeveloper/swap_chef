// Builds API response shapes (docs/API.md) from store records.

export const userSummary = (user) => ({ id: user.id, username: user.username });

async function authorSummary(store, authorId) {
  const author = await store.getUserById(authorId);
  return author ? userSummary(author) : { id: authorId, username: null };
}

/** Browse-list item: { id, title, author, forkCount, createdAt } */
export async function recipeListItem(store, recipe) {
  return {
    id: recipe.id,
    title: recipe.title,
    author: await authorSummary(store, recipe.authorId),
    forkCount: await store.countForks(recipe.id),
    createdAt: recipe.createdAt,
  };
}

/**
 * Full recipe at a given version (latest if omitted). Returns null if that version
 * doesn't exist.
 */
export async function recipeDetail(store, recipe, versionNumber) {
  const version = await store.getVersion(recipe.id, versionNumber);
  if (!version) return null;

  let parent = null;
  if (recipe.parent) {
    const parentRecipe = await store.getRecipe(recipe.parent.recipeId);
    parent = { ...recipe.parent, title: parentRecipe?.title ?? null };
  }

  return {
    id: recipe.id,
    title: recipe.title,
    description: recipe.description,
    prepMinutes: recipe.prepMinutes,
    cookMinutes: recipe.cookMinutes,
    author: await authorSummary(store, recipe.authorId),
    parent,
    forkCount: await store.countForks(recipe.id),
    version: version.version,
    versions: await store.listVersions(recipe.id),
    ingredients: version.ingredients,
    steps: version.steps,
    createdAt: recipe.createdAt,
    updatedAt: recipe.updatedAt,
  };
}
