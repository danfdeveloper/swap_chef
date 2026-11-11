import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app.js';

const app = createApp();

test('GET /api/health returns ok', async () => {
  const res = await request(app).get('/api/health');
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { status: 'ok' });
});

test('unknown route returns 404 in the standard error shape', async () => {
  const res = await request(app).get('/api/nope');
  assert.equal(res.status, 404);
  assert.deepEqual(res.body, { error: { message: 'Not found' } });
});

test('malformed JSON returns 400', async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .set('Content-Type', 'application/json')
    .send('{bad');
  assert.equal(res.status, 400);
  assert.equal(res.body.error.message, 'Invalid JSON body');
});

test('register reports every invalid field', async () => {
  const res = await request(app).post('/api/auth/register').send({ username: 'x', email: 'nope', password: '1' });
  assert.equal(res.status, 400);
  const fields = res.body.error.details.map((d) => d.field).sort();
  assert.deepEqual(fields, ['email', 'password', 'username']);
});

test('GET /api/auth/me without a session returns 401', async () => {
  const res = await request(app).get('/api/auth/me');
  assert.equal(res.status, 401);
});

test('logout without a session still succeeds', async () => {
  const res = await request(app).post('/api/auth/logout');
  assert.equal(res.status, 204);
});

test('protected recipe routes require login', async () => {
  for (const [method, path] of [
    ['post', '/api/recipes'],
    ['post', '/api/recipes/1/forks'],
    ['put', '/api/recipes/1'],
  ]) {
    const res = await request(app)[method](path).send({});
    assert.equal(res.status, 401, `${method.toUpperCase()} ${path}`);
  }
});

test('public recipe routes are reachable without login (stubbed)', async () => {
  for (const path of ['/api/recipes', '/api/recipes/1', '/api/recipes/1/diff', '/api/recipes/1/lineage']) {
    const res = await request(app).get(path);
    assert.equal(res.status, 501, path);
  }
});
