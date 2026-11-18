import { test } from 'node:test';
import assert from 'node:assert/strict';
import Database from 'better-sqlite3';
import { readFileSync } from 'node:fs';

const schema = readFileSync(
    new URL('../../db/schema.sql', import.meta.url),
    'utf8'
);

test('database schema creates all six tables', () => {
    const db = new Database(':memory:');
    db.exec(schema);

    const tables = db.prepare(
        "SELECT name FROM sqlite_master WHERE type = 'table'"
    ).all().map(row => row.name);

    assert.equal(tables.length, 6);

    for (const name of [
        'users', 'recipes', 'recipe_versions',
        'ingredients', 'steps', 'forks'
    ]) {
        assert.ok(tables.includes(name));
    }

    db.close();
});

test('database rejects duplicate usernames', () => {
    const db = new Database(':memory:');
    db.exec(schema);

    const insert = db.prepare(`
        INSERT INTO users
        (username, email, password_hash, created_at)
        VALUES (?, ?, ?, ?)
    `);

    insert.run('testuser', 'test@example.com', 'testhash', '2026-11-18');

    assert.throws(() => {
        insert.run('testuser', 'other@example.com', 'testhash', '2026-11-18');
    }, /UNIQUE constraint failed/);

    db.close();
});

test('database rejects nonexistent foreign keys', () => {
    const db = new Database(':memory:');
    db.exec(schema);

    assert.throws(() => {
        db.prepare(`
            INSERT INTO recipe_versions
            (recipe_id, version, created_at)
            VALUES (?, ?, ?)
        `).run(999, 1, '2026-11-18');
    }, /FOREIGN KEY constraint failed/);

    db.close();
});