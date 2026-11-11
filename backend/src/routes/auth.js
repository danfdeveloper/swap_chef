import { Router } from 'express';
import { validateBody } from '../middleware/validate.js';
import { HttpError } from '../middleware/errors.js';
import { registerSchema, loginSchema } from '../schemas.js';

export const authRouter = Router();

const notImplemented = (req, res, next) => next(new HttpError(501, 'Not implemented yet'));

authRouter.post('/register', validateBody(registerSchema), notImplemented);
authRouter.post('/login', validateBody(loginSchema), notImplemented);

authRouter.post('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie('swapchef.sid');
    res.status(204).end();
  });
});

authRouter.get('/me', (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: { message: 'Not logged in' } });
  res.json({ user: { id: req.session.userId, username: req.session.username } });
});
