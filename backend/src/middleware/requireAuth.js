import { HttpError } from './errors.js';

export function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return next(new HttpError(401, 'You must be logged in'));
  }
  next();
}
