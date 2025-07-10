import { glob } from 'tinyglobby';
import { NEXTJS_IGNORE_PATTERNS } from '@next-dev-tools/shared/constants';
import type { APIRouteInfo } from '@next-dev-tools/shared/types';
import { detectAPIMethod } from '@next-dev-tools/geist';
import fs from 'fs/promises';
import path from 'path';

export async function discoverAPIRoutes(
  rootDir: string = process.cwd(),
): Promise<APIRouteInfo[]> {
  const routePatterns = [
    'app/**/route.{js,jsx,ts,tsx}',
    'src/app/**/route.{js,jsx,ts,tsx}',
    'pages/api/**/*.{js,jsx,ts,tsx}',
    'src/pages/api/**/*.{js,jsx,ts,tsx}',
  ];

  const files = await glob(routePatterns, {
    cwd: rootDir,
    ignore: NEXTJS_IGNORE_PATTERNS,
    absolute: false,
  });
  const routes = await Promise.all(
    files.map(async (file) => {
      const absPath = path.join(rootDir, file);
      const code = await fs.readFile(absPath, 'utf-8');
      const methods = await detectAPIMethod(code);

      return {
        path: file,
        method: methods || [],
      };
    }),
  );

  return routes;
}
