import { Hono } from 'hono';
import type { Handler } from 'hono/types';
import updatedFetch from './fetch';

const API_BASENAME = '/api';
const api = new Hono();

if (globalThis.fetch) {
  globalThis.fetch = updatedFetch;
}

// Helper function to transform file path to Hono route path
function getHonoPath(relativePath: string): { name: string; pattern: string }[] {
  const path = relativePath.replace('../src/app/api', '').replace('/route.js', '');
  const parts = path.split('/').filter(Boolean);
  if (parts.length === 0) {
    return [{ name: 'root', pattern: '' }];
  }
  return parts.map((segment) => {
    const match = segment.match(/^\[(\.{3})?([^\]]+)\]$/);
    if (match) {
      const [_, dots, param] = match;
      return dots === '...'
        ? { name: param, pattern: `:${param}{.+}` }
        : { name: param, pattern: `:${param}` };
    }
    return { name: segment, pattern: segment };
  });
}

// Import and register all routes statically for Vite
const routeModules = import.meta.glob('../src/app/api/**/route.js', { eager: true });

function registerRoutes() {
  // Clear existing routes
  api.routes = [];

  const paths = Object.keys(routeModules).sort((a, b) => b.length - a.length);
  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

  for (const routePath of paths) {
    try {
      const route = routeModules[routePath] as any;
      const parts = getHonoPath(routePath);
      const honoPath = `/${parts.map(({ pattern }) => pattern).join('/')}`;

      for (const method of methods) {
        try {
          if (route[method]) {
            const handler: Handler = async (c) => {
              const params = c.req.param();
              if (import.meta.env.DEV) {
                 // In dev mode, fetch the latest module instance to support HMR
                 const devModules = import.meta.glob('../src/app/api/**/route.js', { eager: true });
                 const updatedRoute = devModules[routePath] as any;
                 return await updatedRoute[method](c.req.raw, { params });
              }
              return await route[method](c.req.raw, { params });
            };
            const methodLowercase = method.toLowerCase();
            switch (methodLowercase) {
              case 'get':
                api.get(honoPath, handler);
                break;
              case 'post':
                api.post(honoPath, handler);
                break;
              case 'put':
                api.put(honoPath, handler);
                break;
              case 'delete':
                api.delete(honoPath, handler);
                break;
              case 'patch':
                api.patch(honoPath, handler);
                break;
              default:
                console.warn(`Unsupported method: ${method}`);
                break;
            }
          }
        } catch (error) {
          console.error(`Error registering route ${routePath} for method ${method}:`, error);
        }
      }
    } catch (error) {
      console.error(`Error setting up route file ${routePath}:`, error);
    }
  }
}

// Initial route registration
registerRoutes();

// Hot reload routes in development
if (import.meta.env.DEV) {
  if (import.meta.hot) {
    import.meta.hot.accept((newSelf) => {
      registerRoutes();
    });
  }
}

export { api, API_BASENAME };
