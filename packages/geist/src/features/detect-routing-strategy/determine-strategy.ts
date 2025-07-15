import type {
  DetectedFeatures,
  PathAnalysis,
} from '@next-dev-tools/shared/types';

export function determineStrategy(
  features: DetectedFeatures,
  pathAnalysis: PathAnalysis,
) {
  let strategy: 'SSG' | 'ISR' | 'SSR' = 'SSR';
  const rationale: string[] = [];

  if (pathAnalysis.routeType === 'api') {
    return {
      strategy: 'SSR' as const,
      rationale: ['API route - always server-side rendered'],
    };
  }

  if (features.isClientComponent) {
    strategy = 'SSG';
    rationale.push('Client component detected');

    if (features.hasUseEffect || features.hasUseState) {
      rationale.push('Uses client-side React hooks');
    }
  }

  const forceSSRConditions = [
    features.usesCookies && 'Uses cookies()',
    features.usesHeaders && 'Uses headers()',
    features.dynamic === 'force-dynamic' && "dynamic: 'force-dynamic'",
    features.fetchCache === 'no-store' && "fetchCache: 'no-store'",
    features.hasFetchWithNoStore && "fetch with cache: 'no-store'",
    features.runtime === 'edge' && 'Edge runtime',
  ].filter(Boolean);

  if (forceSSRConditions.length > 0) {
    strategy = 'SSR';
    rationale.push(...(forceSSRConditions as string[]));
  }

  if (pathAnalysis.isPagesRouter) {
    if (features.hasGetServerSideProps) {
      strategy = 'SSR';
      rationale.push('getServerSideProps detected');
    } else if (features.hasGetStaticProps) {
      if (features.hasRevalidate && features.revalidateValue !== false) {
        strategy = 'ISR';
        rationale.push(
          `getStaticProps with revalidate: ${features.revalidateValue}`,
        );
      } else {
        strategy = 'SSG';
        rationale.push('getStaticProps without revalidate');
      }
    }
  }

  if (pathAnalysis.isAppRouter) {
    if (features.hasGenerateStaticParams) {
      if (features.hasRevalidate && features.revalidateValue !== false) {
        strategy = 'ISR';
        rationale.push(
          `generateStaticParams with revalidate: ${features.revalidateValue}`,
        );
      } else {
        strategy = 'SSG';
        rationale.push('generateStaticParams detected');
      }
    } else if (features.hasRevalidate && features.revalidateValue !== false) {
      strategy = 'ISR';
      rationale.push(`revalidate: ${features.revalidateValue}`);
    } else if (
      features.fetchCache === 'force-cache' ||
      features.hasFetchWithForceCache
    ) {
      strategy = 'SSG';
      rationale.push('Force cache configuration');
    }
  }

  if (pathAnalysis.isDynamic) {
    if (
      strategy === 'SSG' &&
      !features.hasGenerateStaticParams &&
      !features.hasGetStaticProps &&
      !features.hasGetStaticPaths
    ) {
      strategy = 'SSR';
      rationale.push(
        `Dynamic route (${pathAnalysis.dynamicSegments.join(', ')}) without static generation`,
      );
    } else if (strategy === 'SSG') {
      rationale.push(
        `Dynamic route with static generation: ${pathAnalysis.dynamicSegments.join(', ')}`,
      );
    }
  }

  if (rationale.length === 0) {
    rationale.push(
      'No explicit rendering strategy detected - defaulting to SSR',
    );
  }

  if (features.usesSearchParams && strategy !== 'SSR') {
    rationale.push('Uses searchParams - may require SSR');
  }

  return { strategy, rationale };
}
