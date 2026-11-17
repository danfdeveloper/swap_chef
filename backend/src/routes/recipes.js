import { Router } from 'express';
import { isDeepStrictEqual } from 'node:util';
import { requireAuth } from '../middleware/requireAuth.js';
import { validateBody } from '../middleware/validate.js';
import { HttpError } from '../middleware/errors.js';
import { forkSchema, recipeSchema, recipeUpdateSchema } from '../schemas.js';
import { recipeDetail, recipeListItem } from '../views.js';

const isPositiveInt = (value) => /^[1-9]\d*$/.test(value);
const notImplemented = (req, res, next) => next(new HttpError(501, 'Not implemented yet'));

export function createRecipesRouter(store) {
  const router = Router();

  // For /:id routes: reject non-numeric IDs and load the recipe into req.recipe, or 404.
  // Placed after requireAuth so logged-out users get 401 before any lookup.
  const loadRecipe = async (req, res, next) => {
    const { id } = req.params;
    const recipe = isPositiveInt(id) ? await store.getRecipe(Number(id)) : null;
    if (!recipe) throw new HttpError(404, 'Recipe not found');
    req.recipe = recipe;
    next();
  };

  // ---- Public ----

  // Browse: newest first.
  router.get('/', async (req, res) => {
    const recipes = await store.listRecipes();
    res.json({ recipes: await Promise.all(recipes.map((r) => recipeListItem(store, r))) });
  });

  // Detail at the latest version, or ?version=N.
  router.get('/:id', loadRecipe, async (req, res) => {
    const { version } = req.query;
    if (version !== undefined && !isPositiveInt(version)) {
      throw new HttpError(400, 'version must be a positive whole number');
    }
    const recipe = await recipeDetail(store, req.recipe, version && Number(version));
    if (!recipe) throw new HttpError(404, 'Version not found');
    res.json({ recipe });
  });

  router.get('/:id/diff', loadRecipe, notImplemented);     // Milestone 4
  router.get('/:id/lineage', loadRecipe, notImplemented);  // Milestone 4

  // ---- Logged-in only ----

  // Publish an original recipe as version 1.
  router.post('/', requireAuth, validateBody(recipeSchema), async (req, res) => {
    const created = await store.createRecipe({ ...req.body, authorId: req.session.userId, parent: null });
    res.status(201).json({ recipe: await recipeDetail(store, created) });
  });

  // Fork: copy a version (the one in the body, or the latest) into a new recipe owned by
  // the current user, recording the exact parent version. The parent is never modified.
  router.post('/:id/forks', requireAuth, loadRecipe, validateBody(forkSchema), async (req, res) => {
    const parent = req.recipe;
    const source = await store.getVersion(parent.id, req.body.version);
    if (!source) throw new HttpError(404, 'Version not found');
    const created = await store.createRecipe({
      authorId: req.session.userId,
      title: parent.title,
      description: parent.description,
      prepMinutes: parent.prepMinutes,
      cookMinutes: parent.cookMinutes,
      ingredients: source.ingredients,
      steps: source.steps,
      parent: { recipeId: parent.id, version: source.version },
    });
    res.status(201).json({ recipe: await recipeDetail(store, created) });
  });

  // Edit (author only). Title/description/times update the recipe directly. A new version
  // is saved only if ingredients or steps actually differ from the latest version (FR-04),
  // so re-saving the full form without changing them doesn't create an empty version.
  router.put('/:id', requireAuth, loadRecipe, validateBody(recipeUpdateSchema), async (req, res) => {
    const recipe = req.recipe;
    if (recipe.authorId !== req.session.userId) {
      throw new HttpError(403, 'You can only edit your own recipes');
    }

    const { ingredients, steps, ...fields } = req.body;
    const latest = await store.getVersion(recipe.id);
    const next = { ingredients: ingredients ?? latest.ingredients, steps: steps ?? latest.steps };
    const contentChanged =
      !isDeepStrictEqual(next.ingredients, latest.ingredients) || !isDeepStrictEqual(next.steps, latest.steps);
    const fieldsChanged = Object.entries(fields).some(([key, value]) => recipe[key] !== value);

    if (contentChanged) await store.addVersion(recipe.id, next);
    const updated = contentChanged || fieldsChanged ? await store.updateRecipe(recipe.id, fields) : recipe;
    res.json({ recipe: await recipeDetail(store, updated) });
  });

  return router;
}
