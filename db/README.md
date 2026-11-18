# Swap Chef Database

## Setup

The project uses SQLite with the `better-sqlite3` Node.js package.

From the backend directory, install dependencies:

```bash
npm ci
```

Initialize the database:

```bash
node --input-type=module -e "import { initializeDatabase } from './src/store/database.js'; initializeDatabase().close();"
```

This creates `db/swapchef.sqlite` and initializes the database schema.

## Database Tables

- `users`: User accounts and hashed passwords.
- `recipes`: Recipe metadata and ownership.
- `recipe_versions`: Individual recipe versions.
- `ingredients`: Ingredients associated with each version.
- `steps`: Ordered cooking instructions for each version.
- `forks`: Relationships between forked recipes and their exact parent versions.

## Database Integrity

- Foreign key enforcement is enabled.
- Usernames and emails must be unique.
- Ingredient quantities must be positive.
- Preparation and cooking times cannot be negative.
- Forks reference a specific parent recipe version.

## Testing

From the backend directory, run:

```bash
npm test
```

## Current Status

Milestone 1 establishes the database schema and initialization functionality. The backend continues to use in-memory storage until SQLite persistence is implemented in Milestones 2 and 3.

Generated SQLite database files are excluded from version control.