import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { validateBody } from '../middleware/validate.js';
import { HttpError } from '../middleware/errors.js';
import { recipeSchema, recipeUpdateSchema } from '../schemas.js';

export const recipesRouter = Router();

const notImplemented = (req, res, next) => next(new HttpError(501, 'Not implemented yet'));

// Public
recipesRouter.get('/', notImplemented);              // browse, newest first
recipesRouter.get('/:id', notImplemented);           // detail + version history
recipesRouter.get('/:id/diff', notImplemented);      // changes vs. parent version
recipesRouter.get('/:id/lineage', notImplemented);   // ancestors + direct forks

// Logged-in only
recipesRouter.post('/', requireAuth, validateBody(recipeSchema), notImplemented);
recipesRouter.post('/:id/forks', requireAuth, notImplemented);
recipesRouter.put('/:id', requireAuth, validateBody(recipeUpdateSchema), notImplemented);
