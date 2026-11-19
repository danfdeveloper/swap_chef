import { initializeDatabase } from './database.js';
import { ConflictError } from './errors.js';

const now = () => new Date().toISOString();

function mapUser(row) {
    if (!row) return null;

    return {
        id: row.id,
        username: row.username,
        email: row.email,
        passwordHash: row.password_hash,
        createdAt: row.created_at
    };
}

function mapRecipe(row) {
    if (!row) return null;

    return {
        id: row.id,
        authorId: row.author_id,
        title: row.title,
        description: row.description,
        prepMinutes: row.prep_minutes,
        cookMinutes: row.cook_minutes,
        parent: row.parent_recipe_id == null ? null : {
            recipeId: row.parent_recipe_id,
            version: row.parent_version
        },
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };
}

function insertVersion(db, recipeId, version, ingredients, steps, timestamp) {
    db.prepare(`
        INSERT INTO recipe_versions
        (recipe_id, version, created_at)
        VALUES (?, ?, ?)
    `).run(recipeId, version, timestamp);

    const insertIngredient = db.prepare(`
        INSERT INTO ingredients
        (recipe_id, version, position, quantity, unit, name)
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    ingredients.forEach((ingredient, index) => {
        insertIngredient.run(
            recipeId,
            version,
            index + 1,
            ingredient.quantity,
            ingredient.unit,
            ingredient.name
        );
    });

    const insertStep = db.prepare(`
        INSERT INTO steps
        (recipe_id, version, position, instruction)
        VALUES (?, ?, ?, ?)
    `);

    steps.forEach((step, index) => {
        insertStep.run(recipeId, version, index + 1, step);
    });
}

export function createSQLiteStore(db = initializeDatabase()) {
    return {
        // ---- Users ----

        async createUser({ username, email, passwordHash }) {
            email = email.toLowerCase();

            const existingUsername = db.prepare(`
                SELECT id FROM users WHERE username = ?
            `).get(username);

            if (existingUsername) {
                throw new ConflictError('username');
            }

            const existingEmail = db.prepare(`
                SELECT id FROM users WHERE email = ?
            `).get(email);

            if (existingEmail) {
                throw new ConflictError('email');
            }

            const result = db.prepare(`
                INSERT INTO users
                (username, email, password_hash, created_at)
                VALUES (?, ?, ?, ?)
            `).run(username, email, passwordHash, now());

            const row = db.prepare(`
                SELECT * FROM users WHERE id = ?
            `).get(result.lastInsertRowid);

            return mapUser(row);
        },

        async getUserById(id) {
            const row = db.prepare(`
                SELECT * FROM users WHERE id = ?
            `).get(id);

            return mapUser(row);
        },

        async getUserByUsername(username) {
            const row = db.prepare(`
                SELECT * FROM users WHERE username = ?
            `).get(username);

            return mapUser(row);
        },

        // ---- Recipes ----

        async createRecipe({
            authorId, title, description,
            prepMinutes, cookMinutes,
            parent = null, ingredients, steps
        }) {
            const create = db.transaction(() => {
                const timestamp = now();

                const result = db.prepare(`
            INSERT INTO recipes
            (author_id, title, description, prep_minutes,
             cook_minutes, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
                    authorId, title, description,
                    prepMinutes, cookMinutes,
                    timestamp, timestamp
                );

                const recipeId = result.lastInsertRowid;

                insertVersion(
                    db, recipeId, 1,
                    ingredients, steps, timestamp
                );

                if (parent) {
                    db.prepare(`
                INSERT INTO forks
                (child_recipe_id, parent_recipe_id, parent_version)
                VALUES (?, ?, ?)
            `).run(recipeId, parent.recipeId, parent.version);
                }

                return recipeId;
            });

            const recipeId = create();
            return this.getRecipe(recipeId);
        },

        async getRecipe(id) {
            const row = db.prepare(`
        SELECT recipes.*,
               forks.parent_recipe_id,
               forks.parent_version
        FROM recipes
        LEFT JOIN forks ON recipes.id = forks.child_recipe_id
        WHERE recipes.id = ?
    `).get(id);

            return mapRecipe(row);
        },

        async listRecipes() {
            const rows = db.prepare(`
        SELECT recipes.*,
               forks.parent_recipe_id,
               forks.parent_version
        FROM recipes
        LEFT JOIN forks ON recipes.id = forks.child_recipe_id
        ORDER BY recipes.created_at DESC, recipes.id DESC
    `).all();

            return rows.map(mapRecipe);
        },

        async updateRecipe(id, fields) {
            const recipe = await this.getRecipe(id);

            if (!recipe) return null;

            db.prepare(`
        UPDATE recipes
        SET title = ?,
            description = ?,
            prep_minutes = ?,
            cook_minutes = ?,
            updated_at = ?
        WHERE id = ?
    `).run(
                fields.title ?? recipe.title,
                fields.description ?? recipe.description,
                fields.prepMinutes ?? recipe.prepMinutes,
                fields.cookMinutes ?? recipe.cookMinutes,
                now(),
                id
            );

            return this.getRecipe(id);
        },
        // ---- Versions ----

        async addVersion(recipeId, { ingredients, steps }) {
            const save = db.transaction(() => {
                const recipe = db.prepare(`
            SELECT id FROM recipes WHERE id = ?
        `).get(recipeId);

                if (!recipe) return null;

                const result = db.prepare(`
            SELECT MAX(version) AS latest
            FROM recipe_versions
            WHERE recipe_id = ?
        `).get(recipeId);

                const version = (result.latest ?? 0) + 1;

                insertVersion(
                    db, recipeId, version,
                    ingredients, steps, now()
                );

                return version;
            });

            const version = save();

            if (version === null) return null;

            return this.getVersion(recipeId, version);
        },

        async getVersion(recipeId, versionNumber) {
            let row;

            if (versionNumber === undefined) {
                row = db.prepare(`
            SELECT * FROM recipe_versions
            WHERE recipe_id = ?
            ORDER BY version DESC
            LIMIT 1
        `).get(recipeId);
            } else {
                row = db.prepare(`
            SELECT * FROM recipe_versions
            WHERE recipe_id = ? AND version = ?
        `).get(recipeId, versionNumber);
            }

            if (!row) return null;

            const ingredients = db.prepare(`
        SELECT quantity, unit, name
        FROM ingredients
        WHERE recipe_id = ? AND version = ?
        ORDER BY position
    `).all(recipeId, row.version);

            const steps = db.prepare(`
        SELECT instruction
        FROM steps
        WHERE recipe_id = ? AND version = ?
        ORDER BY position
    `).all(recipeId, row.version);

            return {
                version: row.version,
                ingredients,
                steps: steps.map(step => step.instruction),
                createdAt: row.created_at
            };
        },

        async listVersions(recipeId) {
            return db.prepare(`
        SELECT version, created_at AS createdAt
        FROM recipe_versions
        WHERE recipe_id = ?
        ORDER BY version ASC
    `).all(recipeId);
        },
        // ---- Forks ----

        async listForks(recipeId) {
            const rows = db.prepare(`
        SELECT recipes.*,
               forks.parent_recipe_id,
               forks.parent_version
        FROM recipes
        JOIN forks ON recipes.id = forks.child_recipe_id
        WHERE forks.parent_recipe_id = ?
        ORDER BY recipes.created_at ASC, recipes.id ASC
    `).all(recipeId);

            return rows.map(mapRecipe);
        },

        async countForks(recipeId) {
            const result = db.prepare(`
        SELECT COUNT(*) AS count
        FROM forks
        WHERE parent_recipe_id = ?
    `).get(recipeId);

            return result.count;
        }
    };
}