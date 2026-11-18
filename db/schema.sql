PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT NOT NULL COLLATE NOCASE UNIQUE,
    email TEXT NOT NULL COLLATE NOCASE UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS recipes (
    id INTEGER PRIMARY KEY,
    author_id INTEGER NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    prep_minutes INTEGER NOT NULL CHECK(prep_minutes >= 0),
    cook_minutes INTEGER NOT NULL CHECK(cook_minutes >= 0),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS recipe_versions (
    recipe_id INTEGER NOT NULL REFERENCES recipes(id),
    version INTEGER NOT NULL CHECK(version > 0),
    created_at TEXT NOT NULL,

    PRIMARY KEY (recipe_id, version)
);

CREATE TABLE IF NOT EXISTS ingredients (
    recipe_id INTEGER NOT NULL,
    version INTEGER NOT NULL,
    position INTEGER NOT NULL CHECK(position > 0),
    quantity REAL NOT NULL CHECK(quantity > 0),
    unit TEXT,
    name TEXT NOT NULL,

    PRIMARY KEY (recipe_id, version, position),

    FOREIGN KEY (recipe_id, version)
        REFERENCES recipe_versions(recipe_id, version)
);

CREATE TABLE IF NOT EXISTS steps (
    recipe_id INTEGER NOT NULL,
    version INTEGER NOT NULL,
    position INTEGER NOT NULL CHECK(position > 0),
    instruction TEXT NOT NULL,

    PRIMARY KEY (recipe_id, version, position),

    FOREIGN KEY (recipe_id, version)
        REFERENCES recipe_versions(recipe_id, version)
);

CREATE TABLE IF NOT EXISTS forks (
    child_recipe_id INTEGER PRIMARY KEY REFERENCES recipes(id),
    parent_recipe_id INTEGER NOT NULL,
    parent_version INTEGER NOT NULL,

    CHECK(child_recipe_id <> parent_recipe_id),

    FOREIGN KEY (parent_recipe_id, parent_version)
        REFERENCES recipe_versions(recipe_id, version)
);

CREATE INDEX IF NOT EXISTS forks_parent_idx
    ON forks(parent_recipe_id);

CREATE INDEX IF NOT EXISTS recipes_created_idx
    ON recipes(created_at DESC, id DESC);