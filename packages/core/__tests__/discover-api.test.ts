import { it, beforeAll, afterAll, expect } from 'vitest';
import { discoverAPIRoutes } from '../src/features/api/discover-api-routes';
import { createDummy, deleteDummy, testDirPath } from '../__fixtures__/utils';
import { APIRouteInfo } from '@next-dev-tools/shared/types';

let routes: APIRouteInfo[] = [];
const testDirName = 'dummy-api-routes';
const files = [
  'app/api/route.ts',
  'app/api/users/route.ts',
  'app/api/users/[id]/route.ts',
  'app/api/users/[id]/posts/route.ts',
  'app/api/auth/[...nextauth]/route.ts',
  'app/api/docs/[[...slug]]/route.ts',
  'app/api/webhooks/stripe/route.ts',
  'app/api/admin/users/[id]/route.ts',
  'app/api/upload/[type]/route.ts',
  'pages/api/index.ts',
  'pages/api/users/[id].ts',
  'pages/api/users/[id]/posts.ts',
  'pages/api/auth/[...nextauth].ts',
  'pages/api/docs/[[...slug]].ts',
  'pages/api/webhooks/stripe.ts',
  'pages/api/admin/users/[id].ts',
  'pages/api/upload/[type].ts',
  'app/page.tsx',
  'app/layout.tsx',
  'app/loading.tsx',
  'app/error.tsx',
  'app/not-found.tsx',
  'pages/index.tsx',
  'pages/about.tsx',
  'pages/_app.tsx',
  'pages/_document.tsx',
  'pages/[slug].tsx',
  'pages/[...slug].tsx',
  'pages/[[...slug]].tsx',
  'src/middleware.ts',
  'middleware.ts',
  'next.config.js',
  'package.json',
];

function sortRoutes(routes) {
  return [...routes].sort((a, b) => a.path.localeCompare(b.path));
}

beforeAll(async () => {
  createDummy({
    files,
    dir: testDirName,
  });

  routes = await discoverAPIRoutes(testDirPath(testDirName));
});

afterAll(() => {
  deleteDummy(testDirName);
});

it('discovers correct number of API routes', () => {
  expect(routes.length).toBe(17);
});

it('correctly parses pages router routes', () => {
  const pagesRoutes = routes.filter((r) => r.framework === 'pages-router');
  expect(pagesRoutes.length).toBe(8);
  const sortedPagesRoutes = sortRoutes(pagesRoutes);

  expect(sortedPagesRoutes).toEqual(
    sortRoutes([
      {
        path: 'pages/api/index.ts',
        endpoint: '/api/index',
        catchAll: false,
        optional: false,
        framework: 'pages-router',
      },
      {
        path: 'pages/api/users/[id].ts',
        endpoint: '/api/users/[id]',
        catchAll: false,
        optional: false,
        framework: 'pages-router',
      },
      {
        path: 'pages/api/users/[id]/posts.ts',
        endpoint: '/api/users/[id]/posts',
        catchAll: false,
        optional: false,
        framework: 'pages-router',
      },
      {
        path: 'pages/api/auth/[...nextauth].ts',
        endpoint: '/api/auth/[...nextauth]',
        catchAll: true,
        optional: false,
        framework: 'pages-router',
      },
      {
        path: 'pages/api/docs/[[...slug]].ts',
        endpoint: '/api/docs/[...slug]',
        catchAll: true,
        optional: true,
        framework: 'pages-router',
      },
      {
        path: 'pages/api/webhooks/stripe.ts',
        endpoint: '/api/webhooks/stripe',
        catchAll: false,
        optional: false,
        framework: 'pages-router',
      },
      {
        path: 'pages/api/admin/users/[id].ts',
        endpoint: '/api/admin/users/[id]',
        catchAll: false,
        optional: false,
        framework: 'pages-router',
      },
      {
        path: 'pages/api/upload/[type].ts',
        endpoint: '/api/upload/[type]',
        catchAll: false,
        optional: false,
        framework: 'pages-router',
      },
    ]),
  );
});

it('correctly parses app router routes', () => {
  const appRoutes = routes.filter((r) => r.framework === 'app-router');
  const sortedAppRoutes = sortRoutes(appRoutes);

  expect(appRoutes.length).toBe(9);

  expect(sortedAppRoutes).toEqual(
    sortRoutes([
      {
        path: 'app/api/route.ts',
        endpoint: '/api',
        catchAll: false,
        optional: false,
        framework: 'app-router',
      },
      {
        path: 'app/api/users/route.ts',
        endpoint: '/api/users',
        catchAll: false,
        optional: false,
        framework: 'app-router',
      },
      {
        path: 'app/api/users/[id]/route.ts',
        endpoint: '/api/users/[id]',
        catchAll: false,
        optional: false,
        framework: 'app-router',
      },
      {
        path: 'app/api/users/[id]/posts/route.ts',
        endpoint: '/api/users/[id]/posts',
        catchAll: false,
        optional: false,
        framework: 'app-router',
      },
      {
        path: 'app/api/auth/[...nextauth]/route.ts',
        endpoint: '/api/auth/[...nextauth]',
        catchAll: true,
        optional: false,
        framework: 'app-router',
      },
      {
        path: 'app/api/docs/[[...slug]]/route.ts',
        endpoint: '/api/docs/[...slug]',
        catchAll: true,
        optional: true,
        framework: 'app-router',
      },
      {
        path: 'app/api/webhooks/stripe/route.ts',
        endpoint: '/api/webhooks/stripe',
        catchAll: false,
        optional: false,
        framework: 'app-router',
      },
      {
        path: 'app/api/admin/users/[id]/route.ts',
        endpoint: '/api/admin/users/[id]',
        catchAll: false,
        optional: false,
        framework: 'app-router',
      },
      {
        path: 'app/api/upload/[type]/route.ts',
        endpoint: '/api/upload/[type]',
        catchAll: false,
        optional: false,
        framework: 'app-router',
      },
    ]),
  );
});
