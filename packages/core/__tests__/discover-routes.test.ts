import { it, beforeAll, afterAll, expect } from 'vitest';
import { discoverRoutes } from '../src/features/routes/discover-routes';
import { createDummy, deleteDummy, testDirPath } from '../__fixtures__/utils';
import { RouteInfo } from '@next-dev-tools/shared/types';

let routes: RouteInfo[] = [];
const testDirName = 'dummy-routes';
const files = [
  'app/(admin)/page.tsx',
  'app/dashboard/layout.tsx',
  'app/dashboard/page.tsx',
  'app/loading.tsx',
  'app/not-found.tsx',
  'app/error.tsx',
  'src/middleware.ts',
  'src/pages/index.tsx',
  'src/pages/about.tsx',
  'src/pages/api/hello.ts',
  'src/pages/[slug].tsx',
  'src/pages/[...catchall].tsx',
  'src/pages/[[...optional]].tsx',
];

beforeAll(async () => {
  createDummy({
    files,
    dir: testDirName,
  });

  routes = await discoverRoutes(testDirPath(testDirName));
});

afterAll(() => {
  deleteDummy(testDirName);
});

it('discovers correct number of routes', async () => {
  expect(routes.length).toBe(13);
});

it('discovers the page route in app/(admin)/page.tsx', async () => {
  const route = routes.find((r) => r.path.endsWith('app/(admin)/page.tsx'));
  expect(route).toBeDefined();
  expect(route?.routeType).toBe('page');
  expect(route?.url).toBe('/');
  expect(route?.framework).toBe('app-router');
  expect(route?.catchAll).toBe(false);
  expect(route?.optional).toBe(false);
  expect(route?.routeGroups).toContain('admin');
});

it('discovers the layout route in app/dashboard/layout.tsx', async () => {
  const route = routes.find((r) => r.path.endsWith('app/dashboard/layout.tsx'));
  expect(route).toBeDefined();
  expect(route?.routeType).toBe('layout');
  expect(route?.url).toBeNull();
  expect(route?.framework).toBe('app-router');
});

it('discovers the middleware route at src/middleware.ts', async () => {
  const route = routes.find((r) => r.path.endsWith('src/middleware.ts'));
  expect(route).toBeDefined();
  expect(route?.routeType).toBe('middleware');
  expect(route?.url).toBeNull();
  expect(route?.framework).toBe('middleware');
});

it('discovers the pages router index route at src/pages/index.tsx', async () => {
  const route = routes.find((r) => r.path.endsWith('src/pages/index.tsx'));
  expect(route).toBeDefined();
  expect(route?.routeType).toBe('pages-router');
  expect(route?.url).toBe('/');
  expect(route?.framework).toBe('pages-router');
});

it('detects API route at src/pages/api/hello.ts', async () => {
  const route = routes.find((r) => r.path.endsWith('src/pages/api/hello.ts'));
  expect(route).toBeDefined();
  expect(route?.isApiRoute).toBe(true);
});

it('detects dynamic catch-all route at src/pages/[...catchall].tsx', async () => {
  const route = routes.find((r) =>
    r.path.endsWith('src/pages/[...catchall].tsx'),
  );
  expect(route).toBeDefined();
  expect(route?.catchAll).toBe(true);
  expect(route?.optional).toBe(false);
});

it('detects optional catch-all route at src/pages/[[...optional]].tsx', async () => {
  const route = routes.find((r) =>
    r.path.endsWith('src/pages/[[...optional]].tsx'),
  );
  expect(route).toBeDefined();
  expect(route?.catchAll).toBe(true);
  expect(route?.optional).toBe(true);
});

it('correctly extracts route groups in app/(admin)/page.tsx', async () => {
  const route = routes.find((r) => r.path.endsWith('app/(admin)/page.tsx'));
  expect(route?.routeGroups).toEqual(['admin']);
});

it('sorts routes by framework and url', async () => {
  const sorted = [...routes].sort(
    (a, b) =>
      a.framework.localeCompare(b.framework) ||
      (a.url || a.path).localeCompare(b.url || b.path),
  );
  expect(routes).toEqual(sorted);
});
