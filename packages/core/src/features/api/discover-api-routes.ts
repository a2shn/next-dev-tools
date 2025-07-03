import { glob } from 'tinyglobby';
import { NEXTJS_IGNORE_PATTERNS } from '@next-dev-tools/shared/constants';
import { analyzeRoute } from './analyze-route';
import { APIRouteInfo } from '@next-dev-tools/shared/types';

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

  return files.map((file) => analyzeRoute(file));
}
