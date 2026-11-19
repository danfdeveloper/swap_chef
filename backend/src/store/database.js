import Database from 'better-sqlite3';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const databasePath = fileURLToPath(
    new URL('../../../db/swapchef.sqlite', import.meta.url)
);

const schemaPath = fileURLToPath(
    new URL('../../../db/schema.sql', import.meta.url)
);

export function initializeDatabase(path = databasePath) {
    const db = new Database(path);

    db.pragma('foreign_keys = ON');

    const schema = readFileSync(schemaPath, 'utf8');
    db.exec(schema);

    return db;
}