import type {
  DetectedFeatures,
  PathAnalysis,
  DynamicSegment,
} from '@next-dev-tools/shared/types';

export function determineStrategy(
  features: DetectedFeatures,
  pathAnalysis: PathAnalysis,
) {
  const rationale: string[] = [];

  if (pathAnalysis.routeType === 'middleware') {
    return {
      strategy: 'SSR' as const,
      rationale: ['Middleware - always server-side rendered'],
    };
  }

  const forceSSRFeatures = getForceSSRFeatures(features, pathAnalysis);
  if (forceSSRFeatures.length > 0) {
    return {
      strategy: 'SSR' as const,
      rationale: forceSSRFeatures,
    };
  }

  if (pathAnalysis.isPagesRouter) {
    return determinePagesRouterStrategy(features, pathAnalysis, rationale);
  }

  if (pathAnalysis.isAppRouter) {
    return determineAppRouterStrategy(features, pathAnalysis, rationale);
  }

  return determineUnknownRouterStrategy(features, pathAnalysis, rationale);
}

function getForceSSRFeatures(
  features: DetectedFeatures,
  pathAnalysis: PathAnalysis,
): string[] {
  const forceSSRConditions: string[] = [];

  if (features.hasGetServerSideProps) {
    forceSSRConditions.push('getServerSideProps detected');
  }

  if (features.usesCookies) {
    forceSSRConditions.push('Uses cookies() - requires server context');
  }

  if (features.usesHeaders) {
    forceSSRConditions.push('Uses headers() - requires server context');
  }

  if (features.dynamic === 'force-dynamic') {
    forceSSRConditions.push("dynamic: 'force-dynamic' - forces SSR");
  }

  if (features.fetchCache === 'no-store') {
    forceSSRConditions.push("fetchCache: 'no-store' - prevents caching");
  }

  if (features.hasFetchWithNoStore) {
    forceSSRConditions.push("fetch with cache: 'no-store' - prevents caching");
  }

  if (
    features.runtime === 'edge' &&
    (features.usesCookies || features.usesHeaders)
  ) {
    forceSSRConditions.push('Edge runtime with server context - requires SSR');
  }

  if (features.usesSearchParams && !features.isClientComponent) {
    forceSSRConditions.push(
      'Uses searchParams in server component - requires SSR',
    );
  }

  const catchAllSegments = pathAnalysis.dynamicSegments.filter(
    (seg) => seg.catchAll && !seg.optional,
  );
  if (catchAllSegments.length > 0 && !hasStaticGeneration(features)) {
    const segmentNames = catchAllSegments.map((seg) => seg.segment).join(', ');
    forceSSRConditions.push(
      `Catch-all routes (${segmentNames}) without static generation - requires SSR`,
    );
  }

  return forceSSRConditions;
}

function determinePagesRouterStrategy(
  features: DetectedFeatures,
  pathAnalysis: PathAnalysis,
  rationale: string[],
) {
  if (features.hasGetServerSideProps) {
    rationale.push('getServerSideProps detected');
    addDynamicSegmentInfo(pathAnalysis.dynamicSegments, rationale);
    return { strategy: 'SSR' as const, rationale };
  }

  if (features.hasGetStaticProps) {
    if (
      features.hasRevalidate &&
      features.revalidateValue !== false &&
      features.revalidateValue !== 0
    ) {
      rationale.push(
        `getStaticProps with revalidate: ${features.revalidateValue}`,
      );

      if (pathAnalysis.isDynamic) {
        if (features.hasGetStaticPaths) {
          addDynamicSegmentInfo(
            pathAnalysis.dynamicSegments,
            rationale,
            'with getStaticPaths',
          );
        } else {
          rationale.push(
            'Dynamic route without getStaticPaths - may fallback to SSR',
          );
          addDynamicSegmentInfo(pathAnalysis.dynamicSegments, rationale);
        }
      }

      return { strategy: 'ISR' as const, rationale };
    } else {
      rationale.push('getStaticProps without revalidate');

      if (pathAnalysis.isDynamic) {
        if (features.hasGetStaticPaths) {
          addDynamicSegmentInfo(
            pathAnalysis.dynamicSegments,
            rationale,
            'with getStaticPaths',
          );
        } else {
          rationale.push(
            'Dynamic route without getStaticPaths - will fallback to SSR for unknown paths',
          );
          addDynamicSegmentInfo(pathAnalysis.dynamicSegments, rationale);
          return { strategy: 'SSR' as const, rationale };
        }
      }

      return { strategy: 'SSG' as const, rationale };
    }
  }

  if (pathAnalysis.isDynamic) {
    addDynamicSegmentInfo(
      pathAnalysis.dynamicSegments,
      rationale,
      'without static generation',
    );
    return { strategy: 'SSR' as const, rationale };
  }

  if (features.isClientComponent) {
    rationale.push('Client component in Pages Router');
    if (features.hasUseEffect || features.hasUseState) {
      rationale.push('Uses client-side React hooks');
    }
    return { strategy: 'SSG' as const, rationale };
  }

  rationale.push(
    'Pages Router without explicit data fetching - defaults to SSG',
  );
  return { strategy: 'SSG' as const, rationale };
}

function determineAppRouterStrategy(
  features: DetectedFeatures,
  pathAnalysis: PathAnalysis,
  rationale: string[],
) {
  if (features.isClientComponent) {
    return determineClientComponentStrategy(features, pathAnalysis, rationale);
  }

  if (features.hasGenerateStaticParams) {
    if (
      features.hasRevalidate &&
      features.revalidateValue !== false &&
      features.revalidateValue !== 0
    ) {
      rationale.push(
        `generateStaticParams with revalidate: ${features.revalidateValue}`,
      );
      addDynamicSegmentInfo(
        pathAnalysis.dynamicSegments,
        rationale,
        'with static params',
      );
      return { strategy: 'ISR' as const, rationale };
    } else {
      rationale.push('generateStaticParams without revalidate');
      addDynamicSegmentInfo(
        pathAnalysis.dynamicSegments,
        rationale,
        'with static generation',
      );
      return { strategy: 'SSG' as const, rationale };
    }
  }

  if (
    features.hasRevalidate &&
    features.revalidateValue !== false &&
    features.revalidateValue !== 0
  ) {
    rationale.push(`revalidate: ${features.revalidateValue}`);
    if (pathAnalysis.isDynamic) {
      addDynamicSegmentInfo(
        pathAnalysis.dynamicSegments,
        rationale,
        'with ISR',
      );
    }
    return { strategy: 'ISR' as const, rationale };
  }

  if (
    features.fetchCache === 'force-cache' ||
    features.hasFetchWithForceCache
  ) {
    rationale.push('Force cache configuration - static generation');
    return { strategy: 'SSG' as const, rationale };
  }

  if (features.dynamic === 'force-static') {
    rationale.push("dynamic: 'force-static' - forces SSG");
    return { strategy: 'SSG' as const, rationale };
  }

  if (features.usesUnstableCache) {
    rationale.push('Uses unstable_cache - enables caching');
    if (features.hasRevalidate) {
      return { strategy: 'ISR' as const, rationale };
    } else {
      return { strategy: 'SSG' as const, rationale };
    }
  }

  if (pathAnalysis.isDynamic) {
    const hasProblematicSegments = pathAnalysis.dynamicSegments.some(
      (seg) => seg.catchAll && !seg.optional && !hasStaticGeneration(features),
    );

    if (hasProblematicSegments) {
      addDynamicSegmentInfo(
        pathAnalysis.dynamicSegments,
        rationale,
        'without static generation - requires SSR',
      );
      return { strategy: 'SSR' as const, rationale };
    }

    addDynamicSegmentInfo(
      pathAnalysis.dynamicSegments,
      rationale,
      'without static generation',
    );
    return { strategy: 'SSR' as const, rationale };
  }

  if (pathAnalysis.routeType === 'layout') {
    rationale.push('Layout component - typically static');
    return { strategy: 'SSG' as const, rationale };
  }

  if (features.hasMetadata || features.hasGenerateMetadata) {
    if (features.hasGenerateMetadata) {
      rationale.push(
        'generateMetadata function - may require server rendering',
      );
      return { strategy: 'SSR' as const, rationale };
    } else {
      rationale.push('Static metadata export');
      return { strategy: 'SSG' as const, rationale };
    }
  }

  if (features.runtime === 'edge') {
    rationale.push('Edge runtime without server context');
    return { strategy: 'SSG' as const, rationale };
  }

  rationale.push(
    'App Router server component without explicit configuration - defaults to SSG',
  );
  return { strategy: 'SSG' as const, rationale };
}

function determineClientComponentStrategy(
  features: DetectedFeatures,
  pathAnalysis: PathAnalysis,
  rationale: string[],
) {
  rationale.push('Client component detected');

  if (features.hasUseEffect || features.hasUseState) {
    rationale.push('Uses client-side React hooks');
  }

  if (features.usesSearchParams) {
    rationale.push(
      'Uses searchParams in client component - hydrated on client',
    );
  }

  if (pathAnalysis.isDynamic) {
    addDynamicSegmentInfo(
      pathAnalysis.dynamicSegments,
      rationale,
      'in client component',
    );
  }

  if (
    features.hasRevalidate &&
    features.revalidateValue !== false &&
    features.revalidateValue !== 0
  ) {
    rationale.push(
      `Client component with revalidate: ${features.revalidateValue}`,
    );
    return { strategy: 'ISR' as const, rationale };
  }

  return { strategy: 'SSG' as const, rationale };
}

function determineUnknownRouterStrategy(
  features: DetectedFeatures,
  pathAnalysis: PathAnalysis,
  rationale: string[],
) {
  rationale.push('Unknown router type - analyzing features');

  if (features.isClientComponent) {
    rationale.push('Client component');
    if (features.hasUseEffect || features.hasUseState) {
      rationale.push('Uses client-side React hooks');
    }
    return { strategy: 'SSG' as const, rationale };
  }

  if (
    features.hasRevalidate &&
    features.revalidateValue !== false &&
    features.revalidateValue !== 0
  ) {
    rationale.push(`Revalidate configuration: ${features.revalidateValue}`);
    return { strategy: 'ISR' as const, rationale };
  }

  if (
    features.fetchCache === 'force-cache' ||
    features.hasFetchWithForceCache
  ) {
    rationale.push('Force cache configuration');
    return { strategy: 'SSG' as const, rationale };
  }

  if (pathAnalysis.isDynamic) {
    addDynamicSegmentInfo(
      pathAnalysis.dynamicSegments,
      rationale,
      'without static generation',
    );
    return { strategy: 'SSR' as const, rationale };
  }

  rationale.push('No explicit rendering strategy detected - defaulting to SSR');
  return { strategy: 'SSR' as const, rationale };
}

function addDynamicSegmentInfo(
  segments: DynamicSegment[],
  rationale: string[],
  context?: string,
) {
  if (segments.length === 0) return;

  const segmentDescriptions = segments.map((seg) => {
    let desc = seg.segment;
    if (seg.catchAll && seg.optional) {
      desc = `...${seg.segment}? (optional catch-all)`;
    } else if (seg.catchAll) {
      desc = `...${seg.segment} (catch-all)`;
    } else if (seg.optional) {
      desc = `${seg.segment}? (optional)`;
    }

    if (seg.isFilename) {
      desc += ' (filename)';
    }

    return desc;
  });

  const contextSuffix = context ? ` ${context}` : '';
  rationale.push(
    `Dynamic segments: ${segmentDescriptions.join(', ')}${contextSuffix}`,
  );
}

function hasStaticGeneration(features: DetectedFeatures): boolean {
  return (
    features.hasGetStaticProps ||
    features.hasGenerateStaticParams ||
    features.hasGetStaticPaths ||
    features.fetchCache === 'force-cache' ||
    features.hasFetchWithForceCache ||
    features.dynamic === 'force-static'
  );
}
