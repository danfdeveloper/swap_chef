import { Router } from 'express';
import bcrypt from 'bcrypt';
import { validateBody } from '../middleware/validate.js';
import { HttpError } from '../middleware/errors.js';
import { registerSchema, loginSchema } from '../schemas.js';
import { ConflictError } from '../store/errors.js';
import { userSummary } from '../views.js';
import { config } from '../config.js';

// Compared against when a username doesn't exist, so a failed login takes the same time
// whether or not the account exists (prevents finding valid usernames by timing).
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', config.bcryptRounds);

// Start a fresh session on login/register so an old session ID can't be reused
// (prevents session fixation).
function startSession(req, user) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((err) => {
      if (err) return reject(err);
      req.session.userId = user.id;
      req.session.username = user.username;
      resolve();
    });
  });
}

export function createAuthRouter(store) {
  const router = Router();

  router.post('/register', validateBody(registerSchema), async (req, res) => {
    const { username, email, password } = req.body;
    const passwordHash = await bcrypt.hash(password, config.bcryptRounds);
    let user;
    try {
      user = await store.createUser({ username, email, passwordHash });
    } catch (err) {
      if (err instanceof ConflictError) {
        const message = err.field === 'username' ? 'Username is already taken' : 'Email is already registered';
        throw new HttpError(409, message, [{ field: err.field, message }]);
      }
      throw err;
    }
    await startSession(req, user);
    res.status(201).json({ user: userSummary(user) });
  });

  router.post('/login', validateBody(loginSchema), async (req, res) => {
    const { username, password } = req.body;
    const user = await store.getUserByUsername(username);
    const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
    if (!user || !ok) throw new HttpError(401, 'Invalid username or password');
    await startSession(req, user);
    res.json({ user: userSummary(user) });
  });

  router.post('/logout', (req, res, next) => {
    req.session.destroy((err) => {
      if (err) return next(err);
      res.clearCookie('swapchef.sid');
      res.status(204).end();
    });
  });

  router.get('/me', async (req, res) => {
    const user = req.session.userId ? await store.getUserById(req.session.userId) : null;
    if (!user) throw new HttpError(401, 'Not logged in');
    res.json({ user: userSummary(user) });
  });

  return router;
}
