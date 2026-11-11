/**
 * Mock recipe data for frontend development while the API is under construction.
 * Shapes match src/data/shapes.js. Replace with real API calls in later milestones.
 */

/** @type {import('./shapes.js').RecipeDetail[]} */
export const mockRecipes = [
  {
    id: 1,
    title: 'Classic Tomato Pasta',
    description:
      'A simple weeknight pasta with a bright tomato sauce, garlic, and basil.',
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    author: { id: 1, username: 'dan' },
    versionNumber: 1,
    versions: [{ versionNumber: 1, savedAt: '2026-03-01T18:00:00.000Z' }],
    ingredients: [
      { quantity: 12, unit: 'oz', name: 'spaghetti' },
      { quantity: 2, unit: 'tbsp', name: 'olive oil' },
      { quantity: 3, unit: 'clove', name: 'garlic' },
      { quantity: 1, unit: 'can', name: 'crushed tomatoes' },
      { quantity: 0.5, unit: 'tsp', name: 'salt' },
      { quantity: 0.25, unit: 'tsp', name: 'black pepper' },
      { quantity: 8, unit: 'piece', name: 'fresh basil leaves' },
    ],
    steps: [
      { order: 1, instruction: 'Bring a large pot of salted water to a boil and cook the spaghetti until al dente.' },
      { order: 2, instruction: 'Warm olive oil in a skillet over medium heat and sauté minced garlic until fragrant.' },
      { order: 3, instruction: 'Add crushed tomatoes, salt, and pepper. Simmer for 10 minutes.' },
      { order: 4, instruction: 'Toss drained pasta with the sauce and tear in basil leaves before serving.' },
    ],
    parent: null,
    forkCount: 2,
    createdAt: '2026-03-01T18:00:00.000Z',
  },
  {
    id: 2,
    title: 'Spicy Arrabbiata Pasta',
    description:
      'Fork of Classic Tomato Pasta with chili heat and a touch of red pepper flakes.',
    prepTimeMinutes: 10,
    cookTimeMinutes: 22,
    author: { id: 2, username: 'emma' },
    versionNumber: 2,
    versions: [
      { versionNumber: 1, savedAt: '2026-03-02T12:00:00.000Z' },
      { versionNumber: 2, savedAt: '2026-03-03T09:30:00.000Z' },
    ],
    ingredients: [
      { quantity: 12, unit: 'oz', name: 'spaghetti' },
      { quantity: 2, unit: 'tbsp', name: 'olive oil' },
      { quantity: 4, unit: 'clove', name: 'garlic' },
      { quantity: 1, unit: 'can', name: 'crushed tomatoes' },
      { quantity: 1, unit: 'tsp', name: 'red pepper flakes' },
      { quantity: 0.5, unit: 'tsp', name: 'salt' },
      { quantity: 0.25, unit: 'tsp', name: 'black pepper' },
      { quantity: 8, unit: 'piece', name: 'fresh basil leaves' },
    ],
    steps: [
      { order: 1, instruction: 'Bring a large pot of salted water to a boil and cook the spaghetti until al dente.' },
      { order: 2, instruction: 'Warm olive oil in a skillet over medium heat and sauté minced garlic with red pepper flakes until fragrant.' },
      { order: 3, instruction: 'Add crushed tomatoes, salt, and pepper. Simmer for 12 minutes.' },
      { order: 4, instruction: 'Toss drained pasta with the sauce and tear in basil leaves before serving.' },
    ],
    parent: { recipeId: 1, versionNumber: 1, title: 'Classic Tomato Pasta' },
    forkCount: 1,
    createdAt: '2026-03-02T12:00:00.000Z',
  },
  {
    id: 3,
    title: 'Creamy Tomato Pasta',
    description:
      'Another fork of Classic Tomato Pasta finished with a splash of cream.',
    prepTimeMinutes: 12,
    cookTimeMinutes: 25,
    author: { id: 3, username: 'aman' },
    versionNumber: 1,
    versions: [{ versionNumber: 1, savedAt: '2026-03-04T16:45:00.000Z' }],
    ingredients: [
      { quantity: 12, unit: 'oz', name: 'spaghetti' },
      { quantity: 2, unit: 'tbsp', name: 'olive oil' },
      { quantity: 3, unit: 'clove', name: 'garlic' },
      { quantity: 1, unit: 'can', name: 'crushed tomatoes' },
      { quantity: 0.5, unit: 'cup', name: 'heavy cream' },
      { quantity: 0.5, unit: 'tsp', name: 'salt' },
      { quantity: 0.25, unit: 'tsp', name: 'black pepper' },
      { quantity: 8, unit: 'piece', name: 'fresh basil leaves' },
    ],
    steps: [
      { order: 1, instruction: 'Bring a large pot of salted water to a boil and cook the spaghetti until al dente.' },
      { order: 2, instruction: 'Warm olive oil in a skillet over medium heat and sauté minced garlic until fragrant.' },
      { order: 3, instruction: 'Add crushed tomatoes, salt, and pepper. Simmer for 10 minutes, then stir in heavy cream.' },
      { order: 4, instruction: 'Toss drained pasta with the creamy sauce and tear in basil leaves before serving.' },
    ],
    parent: { recipeId: 1, versionNumber: 1, title: 'Classic Tomato Pasta' },
    forkCount: 0,
    createdAt: '2026-03-04T16:45:00.000Z',
  },
  {
    id: 4,
    title: 'Extra Spicy Arrabbiata',
    description:
      'Second-generation fork with more chili and a drizzle of chili oil.',
    prepTimeMinutes: 10,
    cookTimeMinutes: 22,
    author: { id: 4, username: 'mark' },
    versionNumber: 1,
    versions: [{ versionNumber: 1, savedAt: '2026-03-05T11:00:00.000Z' }],
    ingredients: [
      { quantity: 12, unit: 'oz', name: 'spaghetti' },
      { quantity: 2, unit: 'tbsp', name: 'olive oil' },
      { quantity: 4, unit: 'clove', name: 'garlic' },
      { quantity: 1, unit: 'can', name: 'crushed tomatoes' },
      { quantity: 2, unit: 'tsp', name: 'red pepper flakes' },
      { quantity: 1, unit: 'tbsp', name: 'chili oil' },
      { quantity: 0.5, unit: 'tsp', name: 'salt' },
      { quantity: 0.25, unit: 'tsp', name: 'black pepper' },
      { quantity: 8, unit: 'piece', name: 'fresh basil leaves' },
    ],
    steps: [
      { order: 1, instruction: 'Bring a large pot of salted water to a boil and cook the spaghetti until al dente.' },
      { order: 2, instruction: 'Warm olive oil in a skillet over medium heat and sauté minced garlic with red pepper flakes until fragrant.' },
      { order: 3, instruction: 'Add crushed tomatoes, salt, and pepper. Simmer for 12 minutes, then finish with chili oil.' },
      { order: 4, instruction: 'Toss drained pasta with the sauce and tear in basil leaves before serving.' },
    ],
    parent: { recipeId: 2, versionNumber: 2, title: 'Spicy Arrabbiata Pasta' },
    forkCount: 0,
    createdAt: '2026-03-05T11:00:00.000Z',
  },
  {
    id: 5,
    title: 'Lemon Herb Roast Chicken',
    description: 'Whole roast chicken with lemon, garlic, and fresh herbs.',
    prepTimeMinutes: 20,
    cookTimeMinutes: 75,
    author: { id: 1, username: 'dan' },
    versionNumber: 1,
    versions: [{ versionNumber: 1, savedAt: '2026-03-06T14:00:00.000Z' }],
    ingredients: [
      { quantity: 1, unit: 'whole', name: 'chicken' },
      { quantity: 2, unit: 'whole', name: 'lemon' },
      { quantity: 4, unit: 'clove', name: 'garlic' },
      { quantity: 2, unit: 'tbsp', name: 'olive oil' },
      { quantity: 1, unit: 'tsp', name: 'salt' },
      { quantity: 0.5, unit: 'tsp', name: 'black pepper' },
      { quantity: 4, unit: 'sprig', name: 'fresh thyme' },
    ],
    steps: [
      { order: 1, instruction: 'Preheat the oven to 425°F (220°C).' },
      { order: 2, instruction: 'Pat the chicken dry and rub with olive oil, salt, and pepper.' },
      { order: 3, instruction: 'Stuff the cavity with lemon halves, garlic, and thyme.' },
      { order: 4, instruction: 'Roast until the juices run clear and the thickest part of the thigh reaches 165°F.' },
    ],
    parent: null,
    forkCount: 0,
    createdAt: '2026-03-06T14:00:00.000Z',
  },
]

/** Newest-first browse list derived from mockRecipes. */
export function getBrowseRecipes() {
  return [...mockRecipes]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(({ id, title, author, forkCount, createdAt }) => ({
      id,
      title,
      author,
      forkCount,
      createdAt,
    }))
}

/** @param {number|string} id */
export function getRecipeById(id) {
  const numericId = Number(id)
  return mockRecipes.find((recipe) => recipe.id === numericId) ?? null
}

/**
 * Mock lineage for a recipe: ancestors (nearest parent first) + direct forks.
 * @param {number|string} id
 */
export function getRecipeLineage(id) {
  const current = getRecipeById(id)
  if (!current) return null

  const ancestors = []
  let cursor = current
  while (cursor?.parent) {
    const parent = getRecipeById(cursor.parent.recipeId)
    if (!parent) break
    ancestors.push({
      id: parent.id,
      title: parent.title,
      author: parent.author,
      versionNumber: cursor.parent.versionNumber,
    })
    cursor = parent
  }

  const directForks = mockRecipes
    .filter((recipe) => recipe.parent?.recipeId === current.id)
    .map((recipe) => ({
      id: recipe.id,
      title: recipe.title,
      author: recipe.author,
      versionNumber: recipe.versionNumber,
    }))

  return {
    ancestors,
    current: {
      id: current.id,
      title: current.title,
      author: current.author,
      versionNumber: current.versionNumber,
    },
    directForks,
  }
}

/**
 * Simple mock diff of a fork against its parent version's current detail.
 * Not a full matching engine — placeholder until Dan/Aman implement comparison.
 * @param {number|string} id
 */
export function getRecipeDiff(id) {
  const fork = getRecipeById(id)
  if (!fork?.parent) return null

  const parent = getRecipeById(fork.parent.recipeId)
  if (!parent) return null

  const parentNames = new Map(
    parent.ingredients.map((ingredient) => [ingredient.name.toLowerCase(), ingredient]),
  )
  const forkNames = new Map(
    fork.ingredients.map((ingredient) => [ingredient.name.toLowerCase(), ingredient]),
  )

  const ingredientsAdded = fork.ingredients.filter(
    (ingredient) => !parentNames.has(ingredient.name.toLowerCase()),
  )
  const ingredientsRemoved = parent.ingredients.filter(
    (ingredient) => !forkNames.has(ingredient.name.toLowerCase()),
  )
  const ingredientsChanged = fork.ingredients
    .filter((ingredient) => parentNames.has(ingredient.name.toLowerCase()))
    .map((ingredient) => {
      const before = parentNames.get(ingredient.name.toLowerCase())
      if (
        before.quantity === ingredient.quantity &&
        before.unit === ingredient.unit
      ) {
        return null
      }
      return { before, after: ingredient }
    })
    .filter(Boolean)

  const maxSteps = Math.max(parent.steps.length, fork.steps.length)
  const stepsAdded = []
  const stepsChanged = []

  for (let i = 0; i < maxSteps; i += 1) {
    const before = parent.steps[i]
    const after = fork.steps[i]
    if (!before && after) {
      stepsAdded.push(after)
    } else if (before && after && before.instruction !== after.instruction) {
      stepsChanged.push({
        order: after.order,
        before: before.instruction,
        after: after.instruction,
      })
    }
  }

  return {
    forkId: fork.id,
    parentRecipeId: parent.id,
    parentVersionNumber: fork.parent.versionNumber,
    ingredientsAdded,
    ingredientsRemoved,
    ingredientsChanged,
    stepsAdded,
    stepsChanged,
  }
}
