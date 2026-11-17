// Errors any store implementation (in-memory or SQLite) throws for the routes to handle.

/** A unique field (username or email) is already taken. */
export class ConflictError extends Error {
  /** @param {'username' | 'email'} field */
  constructor(field) {
    super(`${field} already in use`);
    this.field = field;
  }
}
