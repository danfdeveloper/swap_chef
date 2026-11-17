import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { freshApp, loggedInAgent } from './helpers.js';

const creds = { username: 'chef_dan', email: 'Dan@Example.com', password: 'password123' };

test('register creates a user, logs them in, and never returns the password', async () => {
  const agent = request.agent(freshApp());
  const res = await agent.post('/api/auth/register').send(creds);
  assert.equal(res.status, 201);
  assert.deepEqual(res.body, { user: { id: 1, username: 'chef_dan' } });
  assert.ok(res.headers['set-cookie'].some((c) => c.startsWith('swapchef.sid=') && c.includes('HttpOnly')));

  const me = await agent.get('/api/auth/me');
  assert.equal(me.status, 200);
  assert.deepEqual(me.body, { user: { id: 1, username: 'chef_dan' } });
});

test('register rejects a duplicate username (any case) or email with 409', async () => {
  const app = freshApp();
  await request(app).post('/api/auth/register').send(creds);

  const sameName = await request(app).post('/api/auth/register').send({ ...creds, username: 'CHEF_DAN', email: 'other@example.com' });
  assert.equal(sameName.status, 409);
  assert.equal(sameName.body.error.details[0].field, 'username');

  const sameEmail = await request(app).post('/api/auth/register').send({ ...creds, username: 'someone', email: 'dan@example.com' });
  assert.equal(sameEmail.status, 409);
  assert.equal(sameEmail.body.error.details[0].field, 'email');
});

test('stored password is a bcrypt hash, not plaintext', async () => {
  const { createMemoryStore } = await import('../src/store/memoryStore.js');
  const { createApp } = await import('../src/app.js');
  const store = createMemoryStore();
  await request(createApp({ store })).post('/api/auth/register').send(creds);
  const user = await store.getUserByUsername('chef_dan');
  assert.notEqual(user.passwordHash, creds.password);
  assert.match(user.passwordHash, /^\$2[aby]\$/);
});

test('login works with the right password and is case-insensitive on username', async () => {
  const app = freshApp();
  await request(app).post('/api/auth/register').send(creds);
  const agent = request.agent(app);
  const res = await agent.post('/api/auth/login').send({ username: 'Chef_Dan', password: creds.password });
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { user: { id: 1, username: 'chef_dan' } });
  assert.equal((await agent.get('/api/auth/me')).status, 200);
});

test('login gives the same 401 for a wrong password and an unknown user', async () => {
  const app = freshApp();
  await request(app).post('/api/auth/register').send(creds);
  const wrong = await request(app).post('/api/auth/login').send({ username: 'chef_dan', password: 'nope-nope' });
  const unknown = await request(app).post('/api/auth/login').send({ username: 'ghost', password: 'nope-nope' });
  assert.equal(wrong.status, 401);
  assert.equal(unknown.status, 401);
  assert.equal(wrong.body.error.message, unknown.body.error.message);
});

test('login issues a new session ID (no session fixation)', async () => {
  const app = freshApp();
  const { agent } = await loggedInAgent(app);
  const before = (await agent.post('/api/auth/login').send({ username: 'chef_dan', password: 'password123' })).headers['set-cookie'][0];
  const after = (await agent.post('/api/auth/login').send({ username: 'chef_dan', password: 'password123' })).headers['set-cookie'][0];
  assert.notEqual(before.split(';')[0], after.split(';')[0]);
});

test('logout ends the session', async () => {
  const { agent } = await loggedInAgent(freshApp());
  assert.equal((await agent.post('/api/auth/logout')).status, 204);
  assert.equal((await agent.get('/api/auth/me')).status, 401);
});
