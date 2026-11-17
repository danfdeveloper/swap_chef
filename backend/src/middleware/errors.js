// Errors we raise on purpose. Their message and details are safe to send to the client.
export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function notFound(req, res) {
  res.status(404).json({ error: { message: 'Not found' } });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  // Malformed JSON body from express.json()
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: { message: 'Invalid JSON body' } });
  }

  // Deliberate errors (HttpError, or 4xx errors from Express/body-parser that mark themselves
  // safe to show) keep their status and message, including 501 "Not implemented yet".
  if (err instanceof HttpError || (err.expose && err.status < 500)) {
    return res.status(err.status).json({
      error: { message: err.message, ...(err.details && { details: err.details }) },
    });
  }

  // Anything else is a bug: log it, and never leak its details to the client.
  console.error(err);
  res.status(500).json({ error: { message: 'Internal server error' } });
}
