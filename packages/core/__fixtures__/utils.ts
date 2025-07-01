import fs from 'fs';
import path from 'path';

const fixturesDir = path.join(process.cwd(), '__fixtures__');

export const tempRoutesTestDir = 'temp-routes-test';
export function createDummyRoutes() {
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

  for (const file of files) {
    const fullPath = path.join(fixturesDir, tempRoutesTestDir, file);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, '// dummy content\n');
  }
}

export function deleteDummyRoutes() {
  if (fs.existsSync(fixturesDir)) {
    fs.rmSync(path.join(fixturesDir, tempRoutesTestDir), {
      recursive: true,
      force: true,
    });
  }
}
