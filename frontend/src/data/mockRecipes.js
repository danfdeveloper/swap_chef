/**
 * Mock recipe data for when the API is unavailable (e.g. 501 stubs).
 * Shapes match docs/API.md / src/data/shapes.js.
 */

/** @type {import('./shapes.js').RecipeDetail[]} */
export const mockRecipes = [
  {
    id: 1,
    title: 'Classic Tomato Pasta',
    description:
      'A simple weeknight pasta with a bright tomato sauce, garlic, and basil.',
    prepMinutes: 10,
    cookMinutes: 20,
    author: { id: 1, username: 'dan' },
    parent: null,
    forkCount: 2,
    version: 1,
    versions: [{ version: 1, createdAt: '2026-03-01T18:00:00.000Z' }],
    ingredients: [
      { quantity: 12, unit: 'oz', name: 'spaghetti' },
      { quantity: 2, unit: 'tbsp', name: 'olive oil' },
      { quantity: 3, unit: 'clove', name: 'garlic' },
      { quantity: 1, unit: 'can', name: 'crushed tomatoes' },
      { quantity: 0.5, unit: 'tsp', name: 'salt' },
      { quantity: 0.25, unit: 'tsp', name: 'black pepper' },
      { quantity: 8, unit: null, name: 'fresh basil leaves' },
    ],
    steps: [
      'Bring a large pot of salted water to a boil and cook the spaghetti until al dente.',
      'Warm olive oil in a skillet over medium heat and sauté minced garlic until fragrant.',
      'Add crushed tomatoes, salt, and pepper. Simmer for 10 minutes.',
      'Toss drained pasta with the sauce and tear in basil leaves before serving.',
    ],
    createdAt: '2026-03-01T18:00:00.000Z',
    updatedAt: '2026-03-01T18:00:00.000Z',
  },
  {
    id: 2,
    title: 'Spicy Arrabbiata Pasta',
    description:
      'Fork of Classic Tomato Pasta with chili heat and a touch of red pepper flakes.',
    prepMinutes: 10,
    cookMinutes: 22,
    author: { id: 2, username: 'emma' },
    parent: { recipeId: 1, version: 1, title: 'Classic Tomato Pasta' },
    forkCount: 1,
    version: 2,
    versions: [
      { version: 1, createdAt: '2026-03-02T12:00:00.000Z' },
      { version: 2, createdAt: '2026-03-03T09:30:00.000Z' },
    ],
    ingredients: [
      { quantity: 12, unit: 'oz', name: 'spaghetti' },
      { quantity: 2, unit: 'tbsp', name: 'olive oil' },
      { quantity: 4, unit: 'clove', name: 'garlic' },
      { quantity: 1, unit: 'can', name: 'crushed tomatoes' },
      { quantity: 1, unit: 'tsp', name: 'red pepper flakes' },
      { quantity: 0.5, unit: 'tsp', name: 'salt' },
      { quantity: 0.25, unit: 'tsp', name: 'black pepper' },
      { quantity: 8, unit: null, name: 'fresh basil leaves' },
    ],
    steps: [
      'Bring a large pot of salted water to a boil and cook the spaghetti until al dente.',
      'Warm olive oil in a skillet over medium heat and sauté minced garlic with red pepper flakes until fragrant.',
      'Add crushed tomatoes, salt, and pepper. Simmer for 12 minutes.',
      'Toss drained pasta with the sauce and tear in basil leaves before serving.',
    ],
    createdAt: '2026-03-02T12:00:00.000Z',
    updatedAt: '2026-03-03T09:30:00.000Z',
  },
  {
    id: 3,
    title: 'Creamy Tomato Pasta',
    description:
      'Another fork of Classic Tomato Pasta finished with a splash of cream.',
    prepMinutes: 12,
    cookMinutes: 25,
    author: { id: 3, username: 'aman' },
    parent: { recipeId: 1, version: 1, title: 'Classic Tomato Pasta' },
    forkCount: 0,
    version: 1,
    versions: [{ version: 1, createdAt: '2026-03-04T16:45:00.000Z' }],
    ingredients: [
      { quantity: 12, unit: 'oz', name: 'spaghetti' },
      { quantity: 2, unit: 'tbsp', name: 'olive oil' },
      { quantity: 3, unit: 'clove', name: 'garlic' },
      { quantity: 1, unit: 'can', name: 'crushed tomatoes' },
      { quantity: 0.5, unit: 'cup', name: 'heavy cream' },
      { quantity: 0.5, unit: 'tsp', name: 'salt' },
      { quantity: 0.25, unit: 'tsp', name: 'black pepper' },
      { quantity: 8, unit: null, name: 'fresh basil leaves' },
    ],
    steps: [
      'Bring a large pot of salted water to a boil and cook the spaghetti until al dente.',
      'Warm olive oil in a skillet over medium heat and sauté minced garlic until fragrant.',
      'Add crushed tomatoes, salt, and pepper. Simmer for 10 minutes, then stir in heavy cream.',
      'Toss drained pasta with the creamy sauce and tear in basil leaves before serving.',
    ],
    createdAt: '2026-03-04T16:45:00.000Z',
    updatedAt: '2026-03-04T16:45:00.000Z',
  },
  {
    id: 4,
    title: 'Extra Spicy Arrabbiata',
    description:
      'Second-generation fork with more chili and a drizzle of chili oil.',
    prepMinutes: 10,
    cookMinutes: 22,
    author: { id: 4, username: 'mark' },
    parent: { recipeId: 2, version: 2, title: 'Spicy Arrabbiata Pasta' },
    forkCount: 0,
    version: 1,
    versions: [{ version: 1, createdAt: '2026-03-05T11:00:00.000Z' }],
    ingredients: [
      { quantity: 12, unit: 'oz', name: 'spaghetti' },
      { quantity: 2, unit: 'tbsp', name: 'olive oil' },
      { quantity: 4, unit: 'clove', name: 'garlic' },
      { quantity: 1, unit: 'can', name: 'crushed tomatoes' },
      { quantity: 2, unit: 'tsp', name: 'red pepper flakes' },
      { quantity: 1, unit: 'tbsp', name: 'chili oil' },
      { quantity: 0.5, unit: 'tsp', name: 'salt' },
      { quantity: 0.25, unit: 'tsp', name: 'black pepper' },
      { quantity: 8, unit: null, name: 'fresh basil leaves' },
    ],
    steps: [
      'Bring a large pot of salted water to a boil and cook the spaghetti until al dente.',
      'Warm olive oil in a skillet over medium heat and sauté minced garlic with red pepper flakes until fragrant.',
      'Add crushed tomatoes, salt, and pepper. Simmer for 12 minutes, then finish with chili oil.',
      'Toss drained pasta with the sauce and tear in basil leaves before serving.',
    ],
    createdAt: '2026-03-05T11:00:00.000Z',
    updatedAt: '2026-03-05T11:00:00.000Z',
  },
  {
    id: 5,
    title: 'Lemon Herb Roast Chicken',
    description: 'Whole roast chicken with lemon, garlic, and fresh herbs.',
    prepMinutes: 20,
    cookMinutes: 75,
    author: { id: 1, username: 'dan' },
    parent: null,
    forkCount: 0,
    version: 1,
    versions: [{ version: 1, createdAt: '2026-03-06T14:00:00.000Z' }],
    ingredients: [
      { quantity: 1, unit: null, name: 'whole chicken' },
      { quantity: 2, unit: null, name: 'lemons' },
      { quantity: 4, unit: 'clove', name: 'garlic' },
      { quantity: 2, unit: 'tbsp', name: 'olive oil' },
      { quantity: 1, unit: 'tsp', name: 'salt' },
      { quantity: 0.5, unit: 'tsp', name: 'black pepper' },
      { quantity: 4, unit: null, name: 'fresh thyme sprigs' },
    ],
    steps: [
      'Preheat the oven to 425°F (220°C).',
      'Pat the chicken dry and rub with olive oil, salt, and pepper.',
      'Stuff the cavity with lemon halves, garlic, and thyme.',
      'Roast until the juices run clear and the thickest part of the thigh reaches 165°F.',
    ],
    createdAt: '2026-03-06T14:00:00.000Z',
    updatedAt: '2026-03-06T14:00:00.000Z',
  },
]

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

/** @param {number|string} id */
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
      version: cursor.parent.version,
    })
    cursor = parent
  }

  const forks = mockRecipes
    .filter((recipe) => recipe.parent?.recipeId === current.id)
    .map((recipe) => ({
      id: recipe.id,
      title: recipe.title,
      author: recipe.author,
    }))

  return {
    ancestors: [...ancestors].reverse(),
    current: {
      id: current.id,
      title: current.title,
      author: current.author,
    },
    forks,
  }
}

/** @param {number|string} id */
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

  const added = fork.ingredients.filter(
    (ingredient) => !parentNames.has(ingredient.name.toLowerCase()),
  )
  const removed = parent.ingredients.filter(
    (ingredient) => !forkNames.has(ingredient.name.toLowerCase()),
  )
  const changed = fork.ingredients
    .filter((ingredient) => parentNames.has(ingredient.name.toLowerCase()))
    .map((ingredient) => {
      const from = parentNames.get(ingredient.name.toLowerCase())
      if (from.quantity === ingredient.quantity && from.unit === ingredient.unit) {
        return null
      }
      return { from, to: ingredient }
    })
    .filter(Boolean)

  const maxSteps = Math.max(parent.steps.length, fork.steps.length)
  const stepsAdded = []
  const stepsChanged = []
  const stepsRemoved = []

  for (let i = 0; i < maxSteps; i += 1) {
    const from = parent.steps[i]
    const to = fork.steps[i]
    if (!from && to) {
      stepsAdded.push({ position: i + 1, text: to })
    } else if (from && !to) {
      stepsRemoved.push({ position: i + 1, text: from })
    } else if (from && to && from !== to) {
      stepsChanged.push({ position: i + 1, from, to })
    }
  }

  return {
    from: {
      recipeId: parent.id,
      version: fork.parent.version,
      title: parent.title,
    },
    to: {
      recipeId: fork.id,
      version: fork.version,
      title: fork.title,
    },
    fields: [],
    ingredients: { added, removed, changed },
    steps: { added: stepsAdded, removed: stepsRemoved, changed: stepsChanged },
  }
}
