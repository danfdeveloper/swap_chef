import express from 'express';
import session from 'express-session';
import { config } from './config.js';
import { createAuthRouter } from './routes/auth.js';
import { createRecipesRouter } from './routes/recipes.js';
import { createMemoryStore } from './store/memoryStore.js';
import { notFound, errorHandler } from './middleware/errors.js';

// `store` is the data-access layer (see src/store/memoryStore.js). Tests pass a fresh one;
// the SQLite version can be passed here once it exists.
export function createApp({ store = createMemoryStore() } = {}) {
  const app = express();

  app.use(express.json({ limit: '100kb' }));

  // Allow the frontend dev server to call the API with cookies.
  app.use((req, res, next) => {
    res.set('Access-Control-Allow-Origin', config.corsOrigin);
    res.set('Access-Control-Allow-Credentials', 'true');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  });

  // MemoryStore is fine for local development; swap in a persistent store
  // once the database layer exists.
  app.use(
    session({
      name: 'swapchef.sid',
      secret: config.sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: config.env === 'production',
        maxAge: 1000 * 60 * 60 * 24 * 7,
      },
    }),
  );

  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
  app.use('/api/auth', createAuthRouter(store));
  app.use('/api/recipes', createRecipesRouter(store));

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
