import { it, beforeAll, afterAll, expect } from 'vitest';
import { discoverRoutes } from './discover-routes';
import {
  createDummy,
  deleteDummy,
  testDirPath,
} from '@next-dev-tools/shared/test-utils';
import { RouteInfo } from '@next-dev-tools/shared/types';

let routes: RouteInfo[] = [];
const testDirName = 'dummy-routes';

beforeAll(async () => {
  createDummy({
    files: [
      'app/(admin)/page.tsx',
      'app/dashboard/layout.tsx',
      'app/dashboard/page.tsx',
      'app/loading.tsx',
      'app/not-found.tsx',
      'app/error.tsx',
      'src/middleware.ts',
      'src/pages/index.tsx',
      'src/pages/about.tsx',
      'src/pages/[slug].tsx',
      'src/pages/[...catchall].tsx',
      'src/pages/[[...optional]].tsx',
    ],
    dir: testDirName,
  });

  routes = await discoverRoutes(testDirPath(testDirName));
});

afterAll(() => {
  deleteDummy(testDirName);
});

it('discovers correct number of routes', async () => {
  expect(routes.length).toBe(12);
});
