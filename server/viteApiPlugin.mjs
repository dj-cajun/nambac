import { createApiMiddleware, loadDevEnv } from './apiMiddleware.mjs';

/**
 * Vite dev plugin — serves /api/* in-process (no separate dev:api port).
 */
export function nambacApiPlugin() {
  return {
    name: 'nambac-api',
    configureServer(server) {
      loadDevEnv();
      server.middlewares.use(createApiMiddleware());
      console.log('🛰️  API mounted at /api (same process as Vite)');
    },
  };
}
