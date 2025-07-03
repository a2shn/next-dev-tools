import { APIRouteInfo } from '@next-dev-tools/shared/types';

export function analyzeRoute(filePath: string): APIRouteInfo {
  const normalizedPath = filePath.replace(/\\/g, '/');
  const isAppRouter =
    (normalizedPath.includes('/app/') &&
      normalizedPath.endsWith('/route.js')) ||
    normalizedPath.endsWith('/route.jsx') ||
    normalizedPath.endsWith('/route.ts') ||
    normalizedPath.endsWith('/route.tsx');

  if (isAppRouter) {
    return parseAppRouterFile(normalizedPath);
  } else {
    return parsePagesRouterFile(normalizedPath);
  }
}

function parseAppRouterFile(filePath: string): APIRouteInfo {
  let routePath = filePath.replace(/^src\//, '');
  routePath = routePath
    .replace(/^app\//, '')
    .replace(/\/route\.(js|jsx|ts|tsx)$/, '');

  const segments = routePath.split('/').filter(Boolean);

  const { endpoint, catchAll, optional } = processSegments(segments, '');

  return {
    path: filePath,
    endpoint,
    catchAll,
    optional,
    framework: 'app-router',
  };
}

function parsePagesRouterFile(filePath: string): APIRouteInfo {
  let routePath = filePath.replace(/^src\//, '');
  routePath = routePath
    .replace(/^pages\/api\//, '')
    .replace(/\.(js|jsx|ts|tsx)$/, '');

  const segments = routePath.split('/');
  const { endpoint, catchAll, optional } = processSegments(segments, '/api');

  return {
    path: filePath,
    endpoint,
    catchAll,
    optional,
    framework: 'pages-router',
  };
}
function processSegments(segments: string[], basePath = '') {
  let catchAll = false;
  let optional = false;

  const processedSegments = segments.map((segment) => {
    if (segment.match(/^\[\[\.\.\..*\]\]$/)) {
      optional = true;
      catchAll = true;
      const paramName = segment.slice(5, -2);

      return `[...${paramName}]`;
    }

    if (segment.match(/^\[\.\.\..*\]$/)) {
      catchAll = true;

      return segment;
    }

    if (segment.match(/^\[.*\]$/)) {
      return segment;
    }

    return segment;
  });

  const endpoint =
    (basePath || '') +
    (processedSegments.length > 0 ? '/' + processedSegments.join('/') : '');

  return {
    endpoint: endpoint || '/',
    catchAll,
    optional,
  };
}
