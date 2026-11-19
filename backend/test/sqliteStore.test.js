import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initializeDatabase } from '../src/store/database.js';
import { createSQLiteStore } from '../src/store/sqliteStore.js';
import { ConflictError } from '../src/store/errors.js';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('SQLite store creates and retrieves a user', async () => {
    const db = initializeDatabase(':memory:');
    const store = createSQLiteStore(db);

    const user = await store.createUser({
        username: 'TestUser',
        email: 'test@example.com',
        passwordHash: 'examplehash'
    });

    assert.equal(user.username, 'TestUser');
    assert.equal(user.passwordHash, 'examplehash');

    const retrieved = await store.getUserById(user.id);
    assert.deepEqual(retrieved, user);

    db.close();
});

test('SQLite username lookup is case-insensitive', async () => {
    const db = initializeDatabase(':memory:');
    const store = createSQLiteStore(db);

    const user = await store.createUser({
        username: 'TestUser',
        email: 'test@example.com',
        passwordHash: 'examplehash'
    });

    const retrieved = await store.getUserByUsername('testuser');
    assert.deepEqual(retrieved, user);

    db.close();
});

test('SQLite store rejects duplicate users', async () => {
    const db = initializeDatabase(':memory:');
    const store = createSQLiteStore(db);

    await store.createUser({
        username: 'TestUser',
        email: 'test@example.com',
        passwordHash: 'examplehash'
    });

    await assert.rejects(
        store.createUser({
            username: 'testuser',
            email: 'other@example.com',
            passwordHash: 'examplehash'
        }),
        ConflictError
    );

    await assert.rejects(
        store.createUser({
            username: 'AnotherUser',
            email: 'test@example.com',
            passwordHash: 'examplehash'
        }),
        ConflictError
    );

    db.close();
});

test('SQLite store returns null for missing users', async () => {
    const db = initializeDatabase(':memory:');
    const store = createSQLiteStore(db);

    assert.equal(await store.getUserById(999), null);
    assert.equal(await store.getUserByUsername('missing'), null);

    db.close();
});

async function createTestRecipe(store) {
    const user = await store.createUser({
        username: 'Chef',
        email: 'chef@example.com',
        passwordHash: 'testhash'
    });

    return store.createRecipe({
        authorId: user.id,
        title: 'Pancakes',
        description: 'Simple pancakes',
        prepMinutes: 10,
        cookMinutes: 15,
        ingredients: [
            { quantity: 2, unit: 'cup', name: 'flour' }
        ],
        steps: ['Mix ingredients', 'Cook pancakes']
    });
}

test('SQLite store creates and retrieves recipes', async () => {
    const db = initializeDatabase(':memory:');
    const store = createSQLiteStore(db);

    const recipe = await createTestRecipe(store);

    assert.equal(recipe.title, 'Pancakes');
    assert.equal(recipe.parent, null);
    assert.deepEqual(await store.getRecipe(recipe.id), recipe);

    db.close();
});

test('recipe creation stores version 1, ingredients and steps', async () => {
    const db = initializeDatabase(':memory:');
    const store = createSQLiteStore(db);

    const recipe = await createTestRecipe(store);

    const version = db.prepare(`
        SELECT * FROM recipe_versions WHERE recipe_id = ?
    `).get(recipe.id);

    assert.equal(version.version, 1);

    const ingredients = db.prepare(`
        SELECT * FROM ingredients WHERE recipe_id = ?
    `).all(recipe.id);

    const steps = db.prepare(`
        SELECT * FROM steps
        WHERE recipe_id = ?
        ORDER BY position
    `).all(recipe.id);

    assert.equal(ingredients.length, 1);
    assert.equal(ingredients[0].name, 'flour');
    assert.equal(steps.length, 2);
    assert.equal(steps[0].instruction, 'Mix ingredients');

    db.close();
});

test('SQLite store lists recipes', async () => {
    const db = initializeDatabase(':memory:');
    const store = createSQLiteStore(db);

    const recipe = await createTestRecipe(store);

    assert.deepEqual(await store.listRecipes(), [recipe]);

    db.close();
});

test('metadata updates do not create new versions', async () => {
    const db = initializeDatabase(':memory:');
    const store = createSQLiteStore(db);

    const recipe = await createTestRecipe(store);

    const updated = await store.updateRecipe(recipe.id, {
        title: 'Updated Pancakes',
        prepMinutes: 20
    });

    assert.equal(updated.title, 'Updated Pancakes');
    assert.equal(updated.prepMinutes, 20);
    assert.equal(updated.cookMinutes, 15);

    const result = db.prepare(`
        SELECT COUNT(*) AS count
        FROM recipe_versions WHERE recipe_id = ?
    `).get(recipe.id);

    assert.equal(result.count, 1);

    db.close();
});

test('SQLite store retrieves version 1', async () => {
    const db = initializeDatabase(':memory:');
    const store = createSQLiteStore(db);

    const recipe = await createTestRecipe(store);
    const version = await store.getVersion(recipe.id);

    assert.equal(version.version, 1);

    assert.deepEqual(version.ingredients, [
        { quantity: 2, unit: 'cup', name: 'flour' }
    ]);

    assert.deepEqual(version.steps, [
        'Mix ingredients',
        'Cook pancakes'
    ]);

    db.close();
});

test('adding a version preserves previous versions', async () => {
    const db = initializeDatabase(':memory:');
    const store = createSQLiteStore(db);

    const recipe = await createTestRecipe(store);
    const original = await store.getVersion(recipe.id, 1);

    const updated = await store.addVersion(recipe.id, {
        ingredients: [
            { quantity: 3, unit: 'cup', name: 'flour' }
        ],
        steps: ['Mix ingredients', 'Cook slowly']
    });

    assert.equal(updated.version, 2);
    assert.equal(updated.ingredients[0].quantity, 3);

    assert.deepEqual(
        await store.getVersion(recipe.id, 1),
        original
    );

    assert.deepEqual(
        await store.getVersion(recipe.id),
        updated
    );

    db.close();
});

test('SQLite store lists versions in ascending order', async () => {
    const db = initializeDatabase(':memory:');
    const store = createSQLiteStore(db);

    const recipe = await createTestRecipe(store);
    const original = await store.getVersion(recipe.id);

    await store.addVersion(recipe.id, {
        ingredients: original.ingredients,
        steps: original.steps
    });

    await store.addVersion(recipe.id, {
        ingredients: original.ingredients,
        steps: original.steps
    });

    const versions = await store.listVersions(recipe.id);

    assert.deepEqual(
        versions.map(v => v.version),
        [1, 2, 3]
    );

    db.close();
});

test('SQLite store handles missing recipes and versions', async () => {
    const db = initializeDatabase(':memory:');
    const store = createSQLiteStore(db);

    const recipe = await createTestRecipe(store);

    assert.equal(await store.getVersion(recipe.id, 999), null);
    assert.equal(await store.getVersion(999), null);
    assert.deepEqual(await store.listVersions(999), []);

    assert.equal(await store.addVersion(999, {
        ingredients: [],
        steps: []
    }), null);

    db.close();
});

async function createTestFork(store, recipe, versionNumber) {
    const version = await store.getVersion(
        recipe.id, versionNumber
    );

    return store.createRecipe({
        authorId: recipe.authorId,
        title: 'Forked Pancakes',
        description: recipe.description,
        prepMinutes: recipe.prepMinutes,
        cookMinutes: recipe.cookMinutes,
        parent: {
            recipeId: recipe.id,
            version: version.version
        },
        ingredients: version.ingredients,
        steps: version.steps
    });
}

test('fork preserves the exact parent version', async () => {
    const db = initializeDatabase(':memory:');
    const store = createSQLiteStore(db);

    const recipe = await createTestRecipe(store);
    const original = await store.getVersion(recipe.id, 1);

    await store.addVersion(recipe.id, {
        ingredients: [
            { quantity: 3, unit: 'cup', name: 'flour' }
        ],
        steps: ['Mix ingredients', 'Cook slowly']
    });

    const fork = await createTestFork(store, recipe, 1);

    assert.deepEqual(fork.parent, {
        recipeId: recipe.id,
        version: 1
    });

    const forkVersion = await store.getVersion(fork.id);

    assert.deepEqual(
        forkVersion.ingredients,
        original.ingredients
    );

    assert.deepEqual(forkVersion.steps, original.steps);

    db.close();
});

test('editing a fork does not modify its parent', async () => {
    const db = initializeDatabase(':memory:');
    const store = createSQLiteStore(db);

    const recipe = await createTestRecipe(store);
    const original = await store.getVersion(recipe.id);

    const fork = await createTestFork(store, recipe, 1);

    await store.addVersion(fork.id, {
        ingredients: [
            { quantity: 4, unit: 'cup', name: 'flour' }
        ],
        steps: ['Mix and cook']
    });

    assert.deepEqual(
        await store.getVersion(recipe.id),
        original
    );

    db.close();
});

test('listForks and countForks return direct forks only', async () => {
    const db = initializeDatabase(':memory:');
    const store = createSQLiteStore(db);

    const recipe = await createTestRecipe(store);

    const fork1 = await createTestFork(store, recipe, 1);
    const fork2 = await createTestFork(store, recipe, 1);
    const grandchild = await createTestFork(store, fork1, 1);

    assert.equal(await store.countForks(recipe.id), 2);
    assert.equal(await store.countForks(fork1.id), 1);
    assert.equal(await store.countForks(grandchild.id), 0);

    assert.deepEqual(
        await store.listForks(recipe.id),
        [fork1, fork2]
    );

    assert.deepEqual(
        await store.listForks(fork1.id),
        [grandchild]
    );

    db.close();
});

test('invalid parent version rolls back recipe creation', async () => {
    const db = initializeDatabase(':memory:');
    const store = createSQLiteStore(db);

    const recipe = await createTestRecipe(store);
    const original = await store.getVersion(recipe.id);

    await assert.rejects(
        store.createRecipe({
            authorId: recipe.authorId,
            title: 'Invalid Fork',
            description: recipe.description,
            prepMinutes: 10,
            cookMinutes: 15,
            parent: {
                recipeId: recipe.id,
                version: 999
            },
            ingredients: original.ingredients,
            steps: original.steps
        }),
        /FOREIGN KEY constraint failed/
    );

    assert.equal((await store.listRecipes()).length, 1);
    assert.equal(await store.countForks(recipe.id), 0);

    db.close();
});

test('SQLite data persists after closing and reopening the database', async () => {
    const directory = mkdtempSync(join(tmpdir(), 'swapchef-'));
    const path = join(directory, 'test.sqlite');

    let db;

    try {
        db = initializeDatabase(path);
        let store = createSQLiteStore(db);

        const recipe = await createTestRecipe(store);
        const user = await store.getUserById(recipe.authorId);

        const version1 = await store.getVersion(recipe.id, 1);

        const version2 = await store.addVersion(recipe.id, {
            ingredients: [
                { quantity: 3, unit: 'cup', name: 'flour' }
            ],
            steps: ['Mix ingredients', 'Cook slowly']
        });

        const fork = await createTestFork(store, recipe, 1);

        // Simulate a server restart.
        db.close();

        db = initializeDatabase(path);
        store = createSQLiteStore(db);

        assert.deepEqual(await store.getUserById(user.id), user);
        assert.deepEqual(await store.getRecipe(recipe.id), recipe);
        assert.deepEqual(await store.getVersion(recipe.id, 1), version1);
        assert.deepEqual(await store.getVersion(recipe.id, 2), version2);
        assert.deepEqual(await store.getRecipe(fork.id), fork);
        assert.equal(await store.countForks(recipe.id), 1);

    } finally {
        if (db?.open) db.close();

        rmSync(directory, {
            recursive: true,
            force: true
        });
    }
});