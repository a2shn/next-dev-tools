import type {
  PathAnalysis,
  DynamicSegment,
} from '@next-dev-tools/shared/types';
import { extname } from 'path';

export function analyzePath(filePath: string): PathAnalysis {
  filePath = filePath.startsWith('/') ? filePath : `/${filePath}`;

  const normalizedPath = filePath.replace(/\\/g, '/');
  const segments = normalizedPath.split('/').filter(Boolean);
  const file = segments[segments.length - 1];
  if (!file)
    throw new Error(
      '[FATAL] Internal geist error: commit an issue on github. This error originates from internal tooling and can only be solved by maintainers!',
    );
  const ext = extname(file);
  const filename = file.slice(0, -ext.length);

  const isAppRouter = normalizedPath.includes('/app/');
  const isPagesRouter = normalizedPath.includes('/pages/');
  const isApiRoute = normalizedPath.includes('/api/');
  const isMiddleware = filename === 'middleware';
  const isLayout = filename === 'layout' || file === 'layout';
  const isPage =
    (isPagesRouter && ext && !isApiRoute) ||
    (isAppRouter && filename === 'page');

  let routeType: PathAnalysis['routeType'] = 'unknown';

  if (isApiRoute) routeType = 'api';
  else if (isMiddleware) routeType = 'middleware';
  else if (isLayout) routeType = 'layout';
  else if (isPage) routeType = 'page';

  const hasUppercaseRouterDir = /\/APP\/|\/PAGES\//.test(normalizedPath);
  if (hasUppercaseRouterDir) {
    routeType = 'unknown';
  }

  const dynamicSegments: DynamicSegment[] = [];

  function parseDynamicSegment(
    segment: string,
    position: number,
    isFilename = false,
  ): DynamicSegment | null {
    let catchAll = false;
    let optional = false;
    let paramName = '';
    const originalPattern = segment;

    if (segment.startsWith('[[...') && segment.endsWith(']]')) {
      paramName = segment.slice(5, -2);
      catchAll = true;
      optional = true;
    } else if (segment.startsWith('[...') && segment.endsWith(']')) {
      paramName = segment.slice(4, -1);
      catchAll = true;
      optional = false;
    } else if (segment.startsWith('[') && segment.endsWith(']')) {
      paramName = segment.slice(1, -1);
      catchAll = false;
      optional = false;
    } else {
      return null;
    }

    return {
      segment: paramName,
      catchAll,
      optional,
      position,
      isFilename,
      originalPattern,
    };
  }

  segments.forEach((segment, index) => {
    const dynamicSegment = parseDynamicSegment(segment, index, false);
    if (dynamicSegment) {
      dynamicSegments.push(dynamicSegment);
    }
  });

  const filenameWithoutExt = filename;
  if (filenameWithoutExt.startsWith('[') && filenameWithoutExt.endsWith(']')) {
    const dynamicSegment = parseDynamicSegment(
      filenameWithoutExt,
      segments.length - 1,
      true,
    );
    if (dynamicSegment) {
      const existingSegment = dynamicSegments.find(
        (ds) =>
          ds.segment === dynamicSegment.segment &&
          ds.position === dynamicSegment.position,
      );
      if (!existingSegment) {
        dynamicSegments.push(dynamicSegment);
      }
    }
  }

  const isDynamic = dynamicSegments.length > 0;

  return {
    isAppRouter,
    isApiRoute,
    isPagesRouter,
    isDynamic,
    dynamicSegments,
    routeType,
    segments,
  };
}
