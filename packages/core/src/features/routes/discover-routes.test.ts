import { it, expect, vi } from 'vitest';
import { discoverRoutes } from './discover-routes.ts';
import { glob } from 'tinyglobby';

vi.mock('tinyglobby', () => {
  return {
    glob: vi.fn(async (patterns: string | string[]) => {
      const arr = Array.isArray(patterns) ? patterns : [patterns];
      const matches = mockFiles.filter((f) =>
        arr.some((pattern) => f.includes(pattern.replace(/^.*/, ''))),
      );
      return matches;
    }),
  };
});

const mockFiles = [
  '/project/app/dashboard/page.tsx',
  '/project/app/(group)/settings/page.tsx',
  '/project/app/(.)modal/page.tsx',
  '/project/app/(group)/[slug]/page.tsx',
  '/project/app/profile/[id]/page.tsx',
  '/project/app/@parallel/settings/page.tsx',
  '/project/pages/api/user.ts',
  '/project/pages/_app.tsx',
  '/project/pages/_document.tsx',
  '/project/pages/404.tsx',
  '/project/pages/500.tsx',
  '/project/pages/[slug].tsx',
  '/project/pages/blog/[id]/index.tsx',
  '/project/middleware.ts',
];

it('detects app router routes', async () => {
  const routes = await discoverRoutes('/project');

  expect(glob).toHaveBeenCalled();
  expect(routes).toContainEqual(
    expect.objectContaining({
      path: '/project/app/dashboard/page.tsx',
      type: 'page',
      router: 'app',
    }),
  );
  expect(routes).toContainEqual(
    expect.objectContaining({
      path: '/project/app/(group)/settings/page.tsx',
      isRouteGroup: true,
    }),
  );
  expect(routes).toContainEqual(
    expect.objectContaining({
      path: '/project/app/(.)modal/page.tsx',
      isIntercepting: true,
    }),
  );
  expect(routes).toContainEqual(
    expect.objectContaining({
      path: '/project/app/(group)/[slug]/page.tsx',
    }),
  );
  expect(routes).toContainEqual(
    expect.objectContaining({
      path: '/project/app/profile/[id]/page.tsx',
    }),
  );
  expect(routes).toContainEqual(
    expect.objectContaining({
      path: '/project/app/@parallel/settings/page.tsx',
      isParallel: true,
    }),
  );
});

it('detects pages router routes', async () => {
  const routes = await discoverRoutes('/project');

  expect(routes).toContainEqual(
    expect.objectContaining({
      path: '/project/pages/api/user.ts',
      type: 'api',
      router: 'pages',
    }),
  );
  expect(routes).toContainEqual(
    expect.objectContaining({ path: '/project/pages/_app.tsx', type: 'app' }),
  );
  expect(routes).toContainEqual(
    expect.objectContaining({
      path: '/project/pages/_document.tsx',
      type: 'document',
    }),
  );
  expect(routes).toContainEqual(
    expect.objectContaining({ path: '/project/pages/404.tsx', type: '404' }),
  );
  expect(routes).toContainEqual(
    expect.objectContaining({ path: '/project/pages/500.tsx', type: '500' }),
  );
  expect(routes).toContainEqual(
    expect.objectContaining({
      path: '/project/pages/[slug].tsx',
    }),
  );
  expect(routes).toContainEqual(
    expect.objectContaining({
      path: '/project/pages/blog/[id]/index.tsx',
    }),
  );
});

it('detects middleware route', async () => {
  const routes = await discoverRoutes('/project');

  expect(routes).toContainEqual(
    expect.objectContaining({
      path: '/project/middleware.ts',
      type: 'middleware',
    }),
  );
});
