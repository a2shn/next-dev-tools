import { RouteInfo } from '@next-dev-tools/shared/types';

export function analyzeRoute(filePath: string, fileName: string): RouteInfo {
  const routeType = getRouteType(fileName);
  const framework = getFramework(filePath);
  const segments = extractSegments(filePath, framework);
  const routeGroups = extractRouteGroups(segments);
  const url = generateRouteUrl(filePath, routeType, framework);
  const { catchAll, optional } = analyzeDynamicSegments(segments);

  return {
    path: filePath,
    name: fileName,
    routeType,
    url,
    segments,
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
