import { z } from 'zod';

// Allowed ingredient units (FR-02 "valid units"). Use null for counted items, e.g. "2 eggs".
// Proposal — confirm with the team before Milestone 2.
export const UNITS = [
  'tsp', 'tbsp', 'cup', 'fl oz', 'ml', 'l',
  'oz', 'lb', 'g', 'kg',
  'pinch', 'dash', 'clove', 'slice', 'can', 'stick', 'package',
];

export const registerSchema = z.object({
  username: z.string().trim().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, 'Letters, numbers, and underscores only'),
  email: z.email().trim().toLowerCase(),
  password: z.string().min(8).max(72), // bcrypt ignores bytes past 72
});

export const loginSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
});

export const ingredientSchema = z.object({
  quantity: z.number().positive(),
  unit: z
    .string()
    .trim()
    .toLowerCase()
    .refine((u) => UNITS.includes(u), { message: `Unit must be one of: ${UNITS.join(', ')}` })
    .nullable(),
  name: z.string().trim().min(1).max(100),
});

const minutes = z.number().int().nonnegative().max(10080); // up to one week

// Full recipe body for publishing (POST /api/recipes).
export const recipeSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000).default(''),
  prepMinutes: minutes,
  cookMinutes: minutes,
  ingredients: z.array(ingredientSchema).min(1).max(100),
  steps: z.array(z.string().trim().min(1).max(2000)).min(1).max(100),
});

// Edit body (PUT /api/recipes/:id). Any subset of fields; at least one required.
// title/description/times update the recipe directly; ingredients/steps create a new version (FR-04).
export const recipeUpdateSchema = z
  .object({
    title: recipeSchema.shape.title,
    description: z.string().trim().max(2000),
    prepMinutes: minutes,
    cookMinutes: minutes,
    ingredients: recipeSchema.shape.ingredients,
    steps: recipeSchema.shape.steps,
  })
  .partial()
  .strict()
  .refine((body) => Object.keys(body).length > 0, { message: 'Provide at least one field to update' });
