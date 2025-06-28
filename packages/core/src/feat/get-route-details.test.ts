import { it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { getRouteDetails } from './get-route-details';

let tempRoot: string;

beforeEach(async () => {
  tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'routes-test-'));
});

afterEach(async () => {
  await fs.rm(tempRoot, { recursive: true, force: true });
});

async function createFile(filePath: string, content = '') {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content);
}

it('detects static app routes', async () => {
  const dir = path.join(tempRoot, 'app', 'home');
  await createFile(path.join(dir, 'page.tsx'));
  const routes = await getRouteDetails({ rootDir: tempRoot });
  expect(routes).toEqual([
    {
      path: '/home',
      type: 'static',
      router: 'app',
      file: expect.stringContaining(path.join('app', 'home')),
    },
  ]);
});

it('detects dynamic app routes', async () => {
  const dir = path.join(tempRoot, 'app', '[user]');
  await createFile(path.join(dir, 'page.jsx'));
  const routes = await getRouteDetails({ rootDir: tempRoot });
  expect(routes).toHaveLength(1);
  expect(routes[0]).toMatchObject({
    path: '/:user',
    type: 'dynamic',
    router: 'app',
  });
});

it('detects catch-all and optional catch-all routes', async () => {
  const catchAll = path.join(tempRoot, 'app', '[...slug]');
  const optionalCatchAll = path.join(tempRoot, 'app', '[[...all]]');
  await createFile(path.join(catchAll, 'page.ts'));
  await createFile(path.join(optionalCatchAll, 'page.ts'));
  const routes = await getRouteDetails({ rootDir: tempRoot });
  expect(routes).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ path: '/*slug', type: 'catch-all' }),
      expect.objectContaining({ path: '/*all', type: 'optional-catch-all' }),
    ]),
  );
});

it('includes API routes when includeApi=true', async () => {
  const dir = path.join(tempRoot, 'app', 'blog');
  await createFile(path.join(dir, 'route.ts'));
  const routes = await getRouteDetails({
    rootDir: tempRoot,
    includeApi: true,
  });
  expect(
    routes.some(
      (r) =>
        r.path === '/api/blog' && r.type === 'static' && r.router === 'app',
    ),
  ).toBe(true);
});

it('finds pages routes and handles index files correctly', async () => {
  const aboutDir = path.join(tempRoot, 'pages', 'about');
  await createFile(path.join(aboutDir, 'index.tsx'));
  const homeFile = path.join(tempRoot, 'pages', 'index.js');
  await createFile(homeFile);
  const routes = await getRouteDetails({ rootDir: tempRoot });
  expect(routes).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ path: '/', router: 'pages' }),
      expect.objectContaining({ path: '/about', router: 'pages' }),
    ]),
  );
});

it('ignores pages/api routes when includeApi=false', async () => {
  const apiDir = path.join(tempRoot, 'pages', 'api', 'users');
  await createFile(path.join(apiDir, 'index.js'));
  const routes = await getRouteDetails({
    rootDir: tempRoot,
    includeApi: false,
  });
  expect(routes.some((r) => r.path.startsWith('/api'))).toBe(false);
});

it('returns an empty array when no app or pages directory exists', async () => {
  const routes = await getRouteDetails({ rootDir: tempRoot });
  expect(routes).toEqual([]);
});
