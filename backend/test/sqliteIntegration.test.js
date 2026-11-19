import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';

import { createApp } from '../src/app.js';
import { initializeDatabase } from '../src/store/database.js';
import { createSQLiteStore } from '../src/store/sqliteStore.js';

test('Express registration persists users in SQLite', async () => {
    const db = initializeDatabase(':memory:');

    try {
        const store = createSQLiteStore(db);
        const app = createApp({ store });

        const response = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'TestChef',
                email: 'testchef@example.com',
                password: 'Password123!'
            });

        assert.equal(response.status, 201);

        const user = await store.getUserByUsername('TestChef');

        assert.ok(user);
        assert.equal(user.email, 'testchef@example.com');
        assert.notEqual(user.passwordHash, 'Password123!');

    } finally {
        db.close();
    }
});