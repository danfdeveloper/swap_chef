import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { freshApp, loggedInAgent, sampleRecipe } from './helpers.js';

test('publish saves version 1 with the author and returns the full recipe', async () => {
  const app = freshApp();
  const { agent, user } = await loggedInAgent(app);
  const res = await agent.post('/api/recipes').send(sampleRecipe());
  assert.equal(res.status, 201);
  const { recipe } = res.body;
  assert.equal(recipe.id, 1);
  assert.equal(recipe.version, 1);
  assert.deepEqual(recipe.versions.map((v) => v.version), [1]);
  assert.deepEqual(recipe.author, user);
  assert.equal(recipe.parent, null);
  assert.equal(recipe.forkCount, 0);
  assert.deepEqual(recipe.ingredients, sampleRecipe().ingredients);
  assert.deepEqual(recipe.steps, sampleRecipe().steps);
});

test('publish rejects guests (401) and invalid input (400)', async () => {
  const app = freshApp();
  assert.equal((await request(app).post('/api/recipes').send(sampleRecipe())).status, 401);
  const { agent } = await loggedInAgent(app);
  const res = await agent.post('/api/recipes').send({ ...sampleRecipe(), ingredients: [] });
  assert.equal(res.status, 400);
  assert.equal(res.body.error.details[0].field, 'ingredients');
});

test('browse is public and lists newest first with author and fork count', async () => {
  const app = freshApp();
  const { agent } = await loggedInAgent(app);
  await agent.post('/api/recipes').send({ ...sampleRecipe(), title: 'First' });
  await agent.post('/api/recipes').send({ ...sampleRecipe(), title: 'Second' });
  await agent.post('/api/recipes/1/forks');

  const res = await request(app).get('/api/recipes');
  assert.equal(res.status, 200);
  assert.deepEqual(res.body.recipes.map((r) => r.title), ['First', 'Second', 'First']);
  assert.deepEqual(res.body.recipes.map((r) => r.id), [3, 2, 1]);
  const original = res.body.recipes.find((r) => r.id === 1);
  assert.equal(original.forkCount, 1);
  assert.deepEqual(original.author, { id: 1, username: 'chef_dan' });
  assert.deepEqual(Object.keys(original).sort(), ['author', 'createdAt', 'forkCount', 'id', 'title']);
});

test('detail is public; bad or missing IDs and versions are handled', async () => {
  const app = freshApp();
  const { agent } = await loggedInAgent(app);
  await agent.post('/api/recipes').send(sampleRecipe());

  assert.equal((await request(app).get('/api/recipes/1')).status, 200);
  assert.equal((await request(app).get('/api/recipes/99')).status, 404);
  assert.equal((await request(app).get('/api/recipes/abc')).status, 404);
  assert.equal((await request(app).get('/api/recipes/1?version=0')).status, 400);
  assert.equal((await request(app).get('/api/recipes/1?version=x')).status, 400);
  assert.equal((await request(app).get('/api/recipes/1?version=2')).status, 404);
});

test('fork copies the latest version, records the exact parent version, and leaves the parent alone', async () => {
  const app = freshApp();
  const { agent: alice } = await loggedInAgent(app, 'alice');
  const { agent: bob, user: bobUser } = await loggedInAgent(app, 'bob');
  await alice.post('/api/recipes').send(sampleRecipe());
  await alice.put('/api/recipes/1').send({ steps: ['Cream butter and sugar.', 'Beat in eggs.', 'Bake 12 minutes.'] });
  const parentBefore = (await request(app).get('/api/recipes/1')).body.recipe;

  const res = await bob.post('/api/recipes/1/forks');
  assert.equal(res.status, 201);
  const fork = res.body.recipe;
  assert.equal(fork.id, 2);
  assert.deepEqual(fork.author, bobUser);
  assert.equal(fork.version, 1);
  assert.deepEqual(fork.parent, { recipeId: 1, version: 2, title: 'Classic Cookies' });
  assert.deepEqual(fork.steps, parentBefore.steps);
  assert.deepEqual(fork.ingredients, parentBefore.ingredients);

  const parentAfter = (await request(app).get('/api/recipes/1')).body.recipe;
  assert.deepEqual({ ...parentAfter, forkCount: 0 }, parentBefore);
  assert.equal(parentAfter.forkCount, 1);
});

test('fork requires login and an existing recipe', async () => {
  const app = freshApp();
  assert.equal((await request(app).post('/api/recipes/1/forks')).status, 401);
  const { agent } = await loggedInAgent(app);
  assert.equal((await agent.post('/api/recipes/1/forks')).status, 404);
});

test('editing a fork never changes the parent', async () => {
  const app = freshApp();
  const { agent: alice } = await loggedInAgent(app, 'alice');
  const { agent: bob } = await loggedInAgent(app, 'bob');
  await alice.post('/api/recipes').send(sampleRecipe());
  await bob.post('/api/recipes/1/forks');
  const parentBefore = (await request(app).get('/api/recipes/1')).body.recipe;

  await bob.put('/api/recipes/2').send({ title: 'Olive Oil Cookies', ingredients: [{ quantity: 0.5, unit: 'cup', name: 'olive oil' }] });

  assert.deepEqual((await request(app).get('/api/recipes/1')).body.recipe, parentBefore);
});

test('edit: ingredient/step changes create a new version and old versions stay retrievable', async () => {
  const app = freshApp();
  const { agent } = await loggedInAgent(app);
  await agent.post('/api/recipes').send(sampleRecipe());

  const newSteps = ['Brown the butter.', 'Cream butter and sugar.', 'Beat in eggs.', 'Bake 12 minutes.'];
  const v2 = (await agent.put('/api/recipes/1').send({ steps: newSteps })).body.recipe;
  assert.equal(v2.version, 2);
  assert.deepEqual(v2.steps, newSteps);
  assert.deepEqual(v2.ingredients, sampleRecipe().ingredients); // unchanged list carried over

  const v3 = (await agent.put('/api/recipes/1').send({ ingredients: [{ quantity: 1, unit: 'cup', name: 'olive oil' }] })).body.recipe;
  assert.equal(v3.version, 3);
  assert.deepEqual(v3.versions.map((v) => v.version), [1, 2, 3]);

  const v1 = (await request(app).get('/api/recipes/1?version=1')).body.recipe;
  assert.equal(v1.version, 1);
  assert.deepEqual(v1.steps, sampleRecipe().steps);
  assert.deepEqual(v1.ingredients, sampleRecipe().ingredients);
});

test('edit: title/time changes update the recipe without creating a version', async () => {
  const app = freshApp();
  const { agent } = await loggedInAgent(app);
  const created = (await agent.post('/api/recipes').send(sampleRecipe())).body.recipe;

  const res = await agent.put('/api/recipes/1').send({ title: 'Better Cookies', cookMinutes: 12 });
  assert.equal(res.status, 200);
  assert.equal(res.body.recipe.title, 'Better Cookies');
  assert.equal(res.body.recipe.cookMinutes, 12);
  assert.equal(res.body.recipe.version, 1);
  assert.ok(res.body.recipe.updatedAt >= created.updatedAt);
});

test('edit: re-saving the whole form unchanged does not create a version', async () => {
  const app = freshApp();
  const { agent } = await loggedInAgent(app);
  await agent.post('/api/recipes').send(sampleRecipe());
  // Unit casing and whitespace are normalized by validation, so this counts as unchanged.
  const resend = { ...sampleRecipe(), title: '  Classic Cookies ', ingredients: sampleRecipe().ingredients.map((i) => ({ ...i, unit: i.unit?.toUpperCase() ?? null })) };
  const res = await agent.put('/api/recipes/1').send(resend);
  assert.equal(res.status, 200);
  assert.equal(res.body.recipe.version, 1);
  assert.deepEqual(res.body.recipe.versions.map((v) => v.version), [1]);
});

test('edit: only the author can edit (403), guests get 401, bad input 400, missing recipe 404', async () => {
  const app = freshApp();
  const { agent: alice } = await loggedInAgent(app, 'alice');
  const { agent: bob } = await loggedInAgent(app, 'bob');
  await alice.post('/api/recipes').send(sampleRecipe());

  assert.equal((await request(app).put('/api/recipes/1').send({ title: 'x' })).status, 401);
  assert.equal((await bob.put('/api/recipes/1').send({ title: 'Mine now' })).status, 403);
  assert.equal((await alice.put('/api/recipes/1').send({})).status, 400);
  assert.equal((await alice.put('/api/recipes/1').send({ authorId: 2 })).status, 400);
  assert.equal((await alice.put('/api/recipes/99').send({ title: 'x' })).status, 404);
  assert.equal((await request(app).get('/api/recipes/1')).body.recipe.title, 'Classic Cookies');
});

test('diff and lineage (Milestone 4) return 501 with a clear message for existing recipes', async () => {
  const app = freshApp();
  const { agent } = await loggedInAgent(app);
  await agent.post('/api/recipes').send(sampleRecipe());
  for (const path of ['/api/recipes/1/diff', '/api/recipes/1/lineage']) {
    const res = await request(app).get(path);
    assert.equal(res.status, 501, path);
    assert.equal(res.body.error.message, 'Not implemented yet', path);
  }
});

test('fork can copy a specific older version', async () => {
  const app = freshApp();
  const { agent: alice } = await loggedInAgent(app, 'alice');
  const { agent: bob } = await loggedInAgent(app, 'bob');
  await alice.post('/api/recipes').send(sampleRecipe());
  await alice.put('/api/recipes/1').send({ steps: ['Version two.'] });
  await alice.put('/api/recipes/1').send({ steps: ['Version three.'] });
  const parentBefore = (await request(app).get('/api/recipes/1')).body.recipe;

  const res = await bob.post('/api/recipes/1/forks').send({ version: 1 });
  assert.equal(res.status, 201);
  assert.deepEqual(res.body.recipe.parent, { recipeId: 1, version: 1, title: 'Classic Cookies' });
  assert.deepEqual(res.body.recipe.steps, sampleRecipe().steps);
  assert.deepEqual(res.body.recipe.ingredients, sampleRecipe().ingredients);
  assert.equal(res.body.recipe.version, 1);

  const parentAfter = (await request(app).get('/api/recipes/1')).body.recipe;
  assert.equal(parentAfter.version, 3);
  assert.deepEqual({ ...parentAfter, forkCount: 0 }, parentBefore);
});

test('fork with an explicit latest version matches forking with no body', async () => {
  const app = freshApp();
  const { agent } = await loggedInAgent(app);
  await agent.post('/api/recipes').send(sampleRecipe());
  await agent.put('/api/recipes/1').send({ steps: ['Version two.'] });
  const explicit = (await agent.post('/api/recipes/1/forks').send({ version: 2 })).body.recipe;
  const implicit = (await agent.post('/api/recipes/1/forks')).body.recipe;
  assert.deepEqual(explicit.parent, implicit.parent);
  assert.deepEqual(explicit.steps, implicit.steps);
});

test('fork rejects an invalid version (400) or a missing one (404)', async () => {
  const app = freshApp();
  const { agent } = await loggedInAgent(app);
  await agent.post('/api/recipes').send(sampleRecipe());
  for (const body of [{ version: 0 }, { version: 1.5 }, { version: '1' }, { other: 1 }]) {
    assert.equal((await agent.post('/api/recipes/1/forks').send(body)).status, 400, JSON.stringify(body));
  }
  const missing = await agent.post('/api/recipes/1/forks').send({ version: 5 });
  assert.equal(missing.status, 404);
  assert.equal(missing.body.error.message, 'Version not found');
  assert.equal((await request(app).get('/api/recipes')).body.recipes.length, 1); // no fork was created
});
