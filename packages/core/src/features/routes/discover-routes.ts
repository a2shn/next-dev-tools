import { glob } from 'tinyglobby';
import type { RouteInfo } from '@next-dev-tools/shared/types';
import { NEXTJS_IGNORE_PATTERNS } from '@next-dev-tools/shared/constants';

export async function discoverRoutes(
  rootDir: string = process.cwd(),
): Promise<RouteInfo[]> {
  const routePatterns = [
    'app/**/page.{js,jsx,ts,tsx}',
    'src/app/**/page.{js,jsx,ts,tsx}',
    'app/**/layout.{js,jsx,ts,tsx}',
    'src/app/**/layout.{js,jsx,ts,tsx}',
    'app/**/loading.{js,jsx,ts,tsx}',
    'src/app/**/loading.{js,jsx,ts,tsx}',
    'app/**/error.{js,jsx,ts,tsx}',
    'src/app/**/error.{js,jsx,ts,tsx}',
    'app/**/not-found.{js,jsx,ts,tsx}',
    'src/app/**/not-found.{js,jsx,ts,tsx}',
    'app/**/default.{js,jsx,ts,tsx}',
    'src/app/**/default.{js,jsx,ts,tsx}',
    'app/**/template.{js,jsx,ts,tsx}',
    'src/app/**/template.{js,jsx,ts,tsx}',
    'middleware.{js,jsx,ts,tsx}',
    'src/middleware.{js,jsx,ts,tsx}',
    'pages/**/*.{js,jsx,ts,tsx}',
    'src/pages/**/*.{js,jsx,ts,tsx}',
  ];

  const routes = await glob(routePatterns, {
    cwd: rootDir,
    ignore: [...NEXTJS_IGNORE_PATTERNS, '**/api/**'],
    absolute: false,
  });

  return routes;
}
