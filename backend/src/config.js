// Load backend/.env if present (works on Node 20.12+ without extra packages).
try {
  process.loadEnvFile();
} catch {
  // No .env file — defaults below are fine for local development.
}

const env = process.env.NODE_ENV ?? 'development';

export const config = {
  env,
  port: Number(process.env.PORT ?? 3000),
  sessionSecret: process.env.SESSION_SECRET ?? 'dev-only-secret-change-me',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
};

if (env === 'production' && !process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET must be set in production');
}
