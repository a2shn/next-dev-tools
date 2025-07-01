import { it, expect, beforeAll, afterAll } from 'vitest';
import { discoverRoutes } from './discover-routes.ts';
import { join } from 'path';
import { mkdir, writeFile, rm } from 'fs/promises';

const tmpDir = join(process.cwd(), '.tmp-test-routes');

const filesToCreate = [
  'app/test/page.tsx',
  'app/test/layout.tsx',
  'app/test/ignored.txt',
  'src/app/example/error.ts',
  'src/app/example/not-found.ts',
  'pages/home.tsx',
  'src/pages/about.tsx',
  'middleware.ts',
  'src/middleware.ts',
  'unrelated/file.txt',
];

beforeAll(async () => {
  for (const file of filesToCreate) {
    const fullPath = join(tmpDir, file);
    await mkdir(join(fullPath, '..'), { recursive: true });
    await writeFile(fullPath, '// test');
  }
});

afterAll(async () => {
  await rm(tmpDir, { recursive: true, force: true });
});

it('detects only route-related files', async () => {
  const routes = await discoverRoutes(tmpDir);

  expect(routes).toContain(join(tmpDir, 'app/test/page.tsx'));
  expect(routes).toContain(join(tmpDir, 'app/test/layout.tsx'));
  expect(routes).toContain(join(tmpDir, 'src/app/example/error.ts'));
  expect(routes).toContain(join(tmpDir, 'src/app/example/not-found.ts'));
  expect(routes).toContain(join(tmpDir, 'pages/home.tsx'));
  expect(routes).toContain(join(tmpDir, 'src/pages/about.tsx'));
  expect(routes).toContain(join(tmpDir, 'middleware.ts'));
  expect(routes).toContain(join(tmpDir, 'src/middleware.ts'));

  expect(routes).not.toContain(join(tmpDir, 'app/test/ignored.txt'));
  expect(routes).not.toContain(join(tmpDir, 'unrelated/file.txt'));
});
