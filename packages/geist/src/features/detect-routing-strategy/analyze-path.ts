import type { PathAnalysis } from '@next-dev-tools/shared/types';

export function analyzePath(filePath: string): PathAnalysis {
  const normalizedPath = filePath.replace(/\\/g, '/');

  const isAppRouter = normalizedPath.includes('/app/');
  const isPagesRouter = normalizedPath.includes('/pages/');

  let routeType: 'page' | 'layout' | 'middleware' | 'unknown' = 'unknown';

  if (normalizedPath.includes('middleware.')) {
    routeType = 'middleware';
  } else if (normalizedPath.includes('layout.')) {
    routeType = 'layout';
  } else if (normalizedPath.includes('page.') || isPagesRouter) {
    routeType = 'page';
  }

  const dynamicSegments: string[] = [];
  const segments = normalizedPath.split('/');

  for (const segment of segments) {
    const standardDynamic = segment.match(/^\[([^\]]+)\]$/);
    if (standardDynamic && standardDynamic[1]) {
      dynamicSegments.push(standardDynamic[1]);
      continue;
    }

    const catchAll = segment.match(/^\[\.\.\.([^\]]+)\]$/);
    if (catchAll) {
      dynamicSegments.push(`...${catchAll[1]}`);
      continue;
    }

    const optionalCatchAll = segment.match(/^\[\[\.\.\.([^\]]+)\]\]$/);
    if (optionalCatchAll) {
      dynamicSegments.push(`...${optionalCatchAll[1]}?`);
      continue;
    }
  }

  const isDynamic = dynamicSegments.length > 0;

  return {
    isAppRouter,
    isPagesRouter,
    isDynamic,
    dynamicSegments,
    routeType,
    segments,
  };
}
