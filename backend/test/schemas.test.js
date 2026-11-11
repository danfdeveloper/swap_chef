import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { recipeSchema, recipeUpdateSchema } from '../src/schemas.js';

const valid = {
  title: 'Toast',
  prepMinutes: 1,
  cookMinutes: 3,
  ingredients: [
    { quantity: 2, unit: 'slice', name: 'bread' },
    { quantity: 1, unit: 'TBSP', name: 'butter' },
    { quantity: 2, unit: null, name: 'eggs' },
  ],
  steps: ['Toast the bread.', 'Butter it.'],
};

const issues = (schema, body) => {
  const r = schema.safeParse(body);
  return r.success ? [] : r.error.issues.map((i) => i.path.join('.'));
};

test('valid recipe passes and is normalized', () => {
  const parsed = recipeSchema.parse({ ...valid, title: '  Toast  ' });
  assert.equal(parsed.title, 'Toast');
  assert.equal(parsed.description, '');
  assert.equal(parsed.ingredients[1].unit, 'tbsp');
});

test('rejects missing required fields', () => {
  assert.deepEqual(issues(recipeSchema, {}).sort(), ['cookMinutes', 'ingredients', 'prepMinutes', 'steps', 'title']);
});

test('rejects non-positive quantities, unknown units, and blank names', () => {
  const bad = {
    ...valid,
    ingredients: [
      { quantity: 0, unit: 'cup', name: 'flour' },
      { quantity: -1, unit: 'cup', name: 'sugar' },
      { quantity: 1, unit: 'bucket', name: 'water' },
      { quantity: 1, unit: 'cup', name: '   ' },
    ],
  };
  assert.deepEqual(issues(recipeSchema, bad), [
    'ingredients.0.quantity',
    'ingredients.1.quantity',
    'ingredients.2.unit',
    'ingredients.3.name',
  ]);
});

test('rejects empty ingredient and step lists, negative or fractional times', () => {
  const bad = { ...valid, ingredients: [], steps: [], prepMinutes: -5, cookMinutes: 1.5 };
  assert.deepEqual(issues(recipeSchema, bad).sort(), ['cookMinutes', 'ingredients', 'prepMinutes', 'steps']);
});

test('update accepts a partial body but not an empty or unknown one', () => {
  assert.deepEqual(issues(recipeUpdateSchema, { cookMinutes: 20 }), []);
  assert.ok(issues(recipeUpdateSchema, {}).length > 0);
  const r = recipeUpdateSchema.safeParse({ authorId: 2 });
  assert.ok(r.error.issues.some((i) => i.code === 'unrecognized_keys'));
});

test('mock recipes in docs/mock/recipes.json pass validation', () => {
  const mock = JSON.parse(readFileSync(new URL('../../docs/mock/recipes.json', import.meta.url)));
  const recipes = Object.entries(mock).filter(([key]) => /^GET \/api\/recipes\/\d+$/.test(key));
  assert.ok(recipes.length > 0);
  for (const [key, { recipe }] of recipes) {
    const { title, description, prepMinutes, cookMinutes, ingredients, steps } = recipe;
    const input = { title, description, prepMinutes, cookMinutes, ingredients, steps };
    assert.deepEqual(issues(recipeSchema, input), [], key);
  }
});
