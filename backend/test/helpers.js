import request from 'supertest';
import { createApp } from '../src/app.js';
import { createMemoryStore } from '../src/store/memoryStore.js';

/** A fresh app with its own empty store, so tests don't share data. */
export function freshApp() {
  return createApp({ store: createMemoryStore() });
}

/** Register a user and return a supertest agent that keeps their session cookie. */
export async function loggedInAgent(app, username = 'chef_dan') {
  const agent = request.agent(app);
  const res = await agent
    .post('/api/auth/register')
    .send({ username, email: `${username}@example.com`, password: 'password123' });
  if (res.status !== 201) throw new Error(`register failed: ${res.status} ${JSON.stringify(res.body)}`);
  return { agent, user: res.body.user };
}

export const sampleRecipe = () => ({
  title: 'Classic Cookies',
  description: 'Chewy and simple.',
  prepMinutes: 15,
  cookMinutes: 10,
  ingredients: [
    { quantity: 1, unit: 'cup', name: 'butter, softened' },
    { quantity: 0.75, unit: 'cup', name: 'sugar' },
    { quantity: 2, unit: null, name: 'eggs' },
  ],
  steps: ['Cream butter and sugar.', 'Beat in eggs.', 'Bake 10 minutes.'],
});
