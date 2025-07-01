import { glob } from 'tinyglobby';
import path from 'path';
import { RouteInfo } from '@next-dev-tools/shared/types';
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
    'app/**/route.{js,jsx,ts,tsx}',
    'src/app/**/route.{js,jsx,ts,tsx}',
    'app/**/default.{js,jsx,ts,tsx}',
    'src/app/**/default.{js,jsx,ts,tsx}',
    'app/**/template.{js,jsx,ts,tsx}',
    'src/app/**/template.{js,jsx,ts,tsx}',
    'pages/**/*.{js,jsx,ts,tsx}',
    'src/pages/**/*.{js,jsx,ts,tsx}',
    'middleware.{js,jsx,ts,tsx}',
    'src/middleware.{js,jsx,ts,tsx}',
  ];

  const files = await glob(routePatterns, {
    cwd: rootDir,
    ignore: NEXTJS_IGNORE_PATTERNS,
    absolute: false,
  });

  const routes: RouteInfo[] = [];

  for (const filePath of files) {
    try {
      const fileName = path.basename(filePath);
      const routeInfo = analyzeRoute(filePath, fileName);
      routes.push(routeInfo);
    } catch (error) {
      console.warn(`Failed to process route: ${filePath}`, error);
    }
  }

  return routes.sort((a, b) => {
    if (a.framework !== b.framework) {
      return a.framework.localeCompare(b.framework);
    }
    return (a.url || a.path).localeCompare(b.url || b.path);
  });
}

function analyzeRoute(filePath: string, fileName: string): RouteInfo {
  const routeType = getRouteType(fileName);
  const framework = getFramework(filePath);
  const segments = extractSegments(filePath, framework);
  const routeGroups = extractRouteGroups(segments);
  const url = generateRouteUrl(filePath, routeType, framework);
  const isApiRoute = checkIfApiRoute(filePath, routeType);
  const { catchAll, optional } = analyzeDynamicSegments(segments);

  return {
    path: filePath,
    name: fileName,
    routeType,
    url,
    segments,
    isApiRoute,
    routeGroups,
    catchAll,
    optional,
    framework,
  };
}

function getRouteType(fileName: string): RouteInfo['routeType'] {
  const name = fileName.split('.')[0];
  switch (name) {
    case 'page':
      return 'page';
    case 'layout':
      return 'layout';
    case 'loading':
      return 'loading';
    case 'error':
      return 'error';
    case 'not-found':
      return 'not-found';
    case 'route':
      return 'route';
    case 'default':
      return 'default';
    case 'template':
      return 'template';
    case 'middleware':
      return 'middleware';
    default:
      return 'pages-router';
  }
}

function getFramework(filePath: string): RouteInfo['framework'] {
  if (filePath.includes('middleware')) return 'middleware';
  if (
    filePath.includes('/app/') ||
    filePath.startsWith('app/') ||
    filePath.includes('/src/app/')
  )
    return 'app-router';
  return 'pages-router';
}

function extractSegments(
  filePath: string,
  framework: RouteInfo['framework'],
): string[] {
  let routePath = filePath.replace(/\.[^/.]+$/, '');
  if (framework === 'app-router') {
    routePath = routePath.replace(/^(src\/)?app\//, '');
    const segments = routePath.split('/');
    if (segments.length > 0) segments.pop();
    return segments.filter(Boolean);
  }
  if (framework === 'pages-router') {
    routePath = routePath.replace(/^(src\/)?pages\//, '');
    const segments = routePath.split('/');
    return segments.filter(Boolean);
  }
  return [];
}

function extractRouteGroups(segments: string[]): string[] {
  return segments
    .filter((segment) => segment.startsWith('(') && segment.endsWith(')'))
    .map((group) => group.slice(1, -1));
}

function generateRouteUrl(
  filePath: string,
  routeType: RouteInfo['routeType'],
  framework: RouteInfo['framework'],
): string | null {
  if (routeType === 'middleware') return null;
  if (
    ['layout', 'loading', 'error', 'not-found', 'default', 'template'].includes(
      routeType,
    )
  )
    return null;

  const segments = extractSegments(filePath, framework);

  if (framework === 'pages-router') {
    if (segments.length === 0) return '/';
    if (segments[segments.length - 1] === 'index') segments.pop();
    if (segments.includes('_app') || segments.includes('_document'))
      return null;
    const url =
      '/' +
      segments.filter((s) => !s.startsWith('(') || !s.endsWith(')')).join('/');
    return url === '/' ? '/' : url;
  }

  if (framework === 'app-router') {
    if (segments.length === 0) return '/';
    const url =
      '/' +
      segments.filter((s) => !s.startsWith('(') || !s.endsWith(')')).join('/');
    return url === '/' ? '/' : url;
  }

  return null;
}

function checkIfApiRoute(
  filePath: string,
  routeType: RouteInfo['routeType'],
): boolean {
  return (
    filePath.includes('/api/') ||
    (routeType === 'route' && filePath.includes('/api/'))
  );
}
function analyzeDynamicSegments(segments: string[]): {
  catchAll: boolean;
  optional: boolean;
} {
  let catchAll = false;
  let optional = false;

  const optionalCatchAllRegex = /^\[\[\.\.\..+\]\]$/;
  const catchAllRegex = /^\[\.\.\..+\]$/;

  for (const segment of segments) {
    if (optionalCatchAllRegex.test(segment)) {
      catchAll = true;
      optional = true;
    } else if (catchAllRegex.test(segment)) {
      catchAll = true;
    }
  }

  return { catchAll, optional };
}
