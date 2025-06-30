import type { RouteInfo } from '@next-dev-tools/shared/types';
import { glob } from 'tinyglobby';

export async function discoverRoutes(
  rootDir: string = process.cwd(),
): Promise<RouteInfo[]> {
  const routes: RouteInfo[] = [];
  const extensions = '{js,jsx,ts,tsx}';

  const appRouterPatterns = [
    `${rootDir}/app/**/page.${extensions}`,
    `${rootDir}/src/app/**/page.${extensions}`,
    `${rootDir}/app/**/layout.${extensions}`,
    `${rootDir}/src/app/**/layout.${extensions}`,
    `${rootDir}/app/**/loading.${extensions}`,
    `${rootDir}/src/app/**/loading.${extensions}`,
    `${rootDir}/app/**/error.${extensions}`,
    `${rootDir}/src/app/**/error.${extensions}`,
    `${rootDir}/app/**/not-found.${extensions}`,
    `${rootDir}/src/app/**/not-found.${extensions}`,
    `${rootDir}/app/**/route.${extensions}`,
    `${rootDir}/src/app/**/route.${extensions}`,
    `${rootDir}/app/**/default.${extensions}`,
    `${rootDir}/src/app/**/default.${extensions}`,
    `${rootDir}/app/**/template.${extensions}`,
    `${rootDir}/src/app/**/template.${extensions}`,
  ];

  const pagesRouterPatterns = [
    `${rootDir}/pages/**/*.${extensions}`,
    `${rootDir}/src/pages/**/*.${extensions}`,
  ];

  const middlewarePatterns = [
    `${rootDir}/middleware.${extensions}`,
    `${rootDir}/src/middleware.${extensions}`,
  ];

  for (const pattern of appRouterPatterns) {
    const files = await glob(pattern, { ignore: ['**/node_modules/**'] });

    for (const file of files) {
      const relativePath = file.replace(rootDir, '').replace(/^\//, '');
      const segments = relativePath.split('/').filter(Boolean);
      const filename = segments[segments.length - 1];
      const routeType = filename.split('.')[0] as RouteInfo['type'];

      const pathSegments = segments.slice(0, -1);
      const isParallel = pathSegments.some((segment) =>
        segment.startsWith('@'),
      );
      const isIntercepting = pathSegments.some(
        (segment) =>
          segment.startsWith('(.)') ||
          segment.startsWith('(..)') ||
          segment.startsWith('(...)') ||
          segment.startsWith('(....)'),
      );
      const isRouteGroup = pathSegments.some(
        (segment) =>
          segment.startsWith('(') && segment.endsWith(')') && !isIntercepting,
      );

      routes.push({
        path: file,
        type: routeType,
        router: 'app',
        isParallel,
        isIntercepting,
        isRouteGroup,
      });
    }
  }

  for (const pattern of pagesRouterPatterns) {
    const files = await glob(pattern, { ignore: ['**/node_modules/**'] });

    for (const file of files) {
      const relativePath = file.replace(rootDir, '').replace(/^\//, '');
      const segments = relativePath.split('/').filter(Boolean);
      const filename = segments[segments.length - 1];
      const nameWithoutExt = filename.split('.')[0];

      let routeType: RouteInfo['type'] = 'page';

      if (nameWithoutExt === '_app') routeType = 'app';
      else if (nameWithoutExt === '_document') routeType = 'document';
      else if (nameWithoutExt === '_error') routeType = 'custom-error';
      else if (nameWithoutExt === '404') routeType = '404';
      else if (nameWithoutExt === '500') routeType = '500';
      else if (segments.includes('api')) routeType = 'api';

      routes.push({
        path: file,
        type: routeType,
        router: 'pages',
        isParallel: false,
        isIntercepting: false,
        isRouteGroup: false,
      });
    }
  }

  for (const pattern of middlewarePatterns) {
    const files = await glob(pattern, { ignore: ['**/node_modules/**'] });

    for (const file of files) {
      routes.push({
        path: file,
        type: 'middleware',
        router: 'app',
        isParallel: false,
        isIntercepting: false,
        isRouteGroup: false,
      });
    }
  }

  return routes.sort((a, b) => a.path.localeCompare(b.path));
}
