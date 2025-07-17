import { it, expect, describe } from 'vitest';
import { determineStrategy } from './determine-strategy';
import type {
  PathAnalysis,
  DynamicSegment,
} from '@next-dev-tools/shared/types';
import { createFeatures } from './features';

const createPathAnalysis = (
  overrides: Partial<PathAnalysis> = {},
): PathAnalysis => ({
  isAppRouter: false,
  isPagesRouter: false,
  isDynamic: false,
  dynamicSegments: [],
  routeType: 'page',
  segments: [],
  ...overrides,
});

const createDynamicSegment = (
  overrides: Partial<DynamicSegment> = {},
): DynamicSegment => ({
  segment: 'id',
  catchAll: false,
  optional: false,
  position: 0,
  isFilename: false,
  originalPattern: '[id]',
  ...overrides,
});

describe('returns SSR on force-SSR conditions', () => {
  it('middleware returns SSR', () => {
    const features = createFeatures();
    const pathAnalysis = createPathAnalysis({ routeType: 'middleware' });
    const result = determineStrategy(features, pathAnalysis);
    expect(result.strategy).toBe('SSR');
  });

  it('getServerSideProps forces SSR', () => {
    const features = createFeatures({ hasGetServerSideProps: true });
    const pathAnalysis = createPathAnalysis();
    const result = determineStrategy(features, pathAnalysis);
    expect(result.strategy).toBe('SSR');
  });

  it('cookies forces SSR', () => {
    const features = createFeatures({ usesCookies: true });
    const pathAnalysis = createPathAnalysis();
    const result = determineStrategy(features, pathAnalysis);
    expect(result.strategy).toBe('SSR');
  });

  it('headers forces SSR', () => {
    const features = createFeatures({ usesHeaders: true });
    const pathAnalysis = createPathAnalysis();
    const result = determineStrategy(features, pathAnalysis);
    expect(result.strategy).toBe('SSR');
  });

  it('force-dynamic forces SSR', () => {
    const features = createFeatures({ dynamic: 'force-dynamic' });
    const pathAnalysis = createPathAnalysis();
    const result = determineStrategy(features, pathAnalysis);
    expect(result.strategy).toBe('SSR');
  });

  it('fetchCache no-store forces SSR', () => {
    const features = createFeatures({ fetchCache: 'no-store' });
    const pathAnalysis = createPathAnalysis();
    const result = determineStrategy(features, pathAnalysis);
    expect(result.strategy).toBe('SSR');
  });

  it('fetch with no-store forces SSR', () => {
    const features = createFeatures({ hasFetchWithNoStore: true });
    const pathAnalysis = createPathAnalysis();
    const result = determineStrategy(features, pathAnalysis);
    expect(result.strategy).toBe('SSR');
  });

  it('edge runtime with cookies forces SSR', () => {
    const features = createFeatures({ runtime: 'edge', usesCookies: true });
    const pathAnalysis = createPathAnalysis();
    const result = determineStrategy(features, pathAnalysis);
    expect(result.strategy).toBe('SSR');
  });

  it('edge runtime with headers forces SSR', () => {
    const features = createFeatures({ runtime: 'edge', usesHeaders: true });
    const pathAnalysis = createPathAnalysis();
    const result = determineStrategy(features, pathAnalysis);
    expect(result.strategy).toBe('SSR');
  });

  it('searchParams in server component forces SSR', () => {
    const features = createFeatures({
      usesSearchParams: true,
      isClientComponent: false,
    });
    const pathAnalysis = createPathAnalysis();
    const result = determineStrategy(features, pathAnalysis);
    expect(result.strategy).toBe('SSR');
  });

  it('catch-all without static generation forces SSR', () => {
    const features = createFeatures();
    const dynamicSegment = createDynamicSegment({
      segment: 'slug',
      catchAll: true,
      optional: false,
    });
    const pathAnalysis = createPathAnalysis({
      isDynamic: true,
      dynamicSegments: [dynamicSegment],
    });
    const result = determineStrategy(features, pathAnalysis);
    expect(result.strategy).toBe('SSR');
  });

  it('optional catch-all does not force SSR', () => {
    const features = createFeatures();
    const dynamicSegment = createDynamicSegment({
      segment: 'slug',
      catchAll: true,
      optional: true,
    });
    const pathAnalysis = createPathAnalysis({
      isDynamic: true,
      isAppRouter: true,
      dynamicSegments: [dynamicSegment],
    });
    const result = determineStrategy(features, pathAnalysis);
    expect(result.strategy).toBe('SSR');
  });

  it('multiple force SSR conditions', () => {
    const features = createFeatures({
      usesCookies: true,
      usesHeaders: true,
      dynamic: 'force-dynamic',
    });
    const pathAnalysis = createPathAnalysis();
    const result = determineStrategy(features, pathAnalysis);
    expect(result.strategy).toBe('SSR');
  });
});

describe('detects routing strategy in pages router', () => {
  it('pages router with getServerSideProps', () => {
    const features = createFeatures({ hasGetServerSideProps: true });
    const pathAnalysis = createPathAnalysis({ isPagesRouter: true });
    const result = determineStrategy(features, pathAnalysis);
    expect(result.strategy).toBe('SSR');
  });

  it('pages router with getServerSideProps and dynamic route', () => {
    const features = createFeatures({ hasGetServerSideProps: true });
    const dynamicSegment = createDynamicSegment();
    const pathAnalysis = createPathAnalysis({
      isPagesRouter: true,
      isDynamic: true,
      dynamicSegments: [dynamicSegment],
    });
    const result = determineStrategy(features, pathAnalysis);
    expect(result.strategy).toBe('SSR');
  });

  it('pages router with getStaticProps without revalidate', () => {
    const features = createFeatures({ hasGetStaticProps: true });
    const pathAnalysis = createPathAnalysis({ isPagesRouter: true });
    const result = determineStrategy(features, pathAnalysis);
    expect(result.strategy).toBe('SSG');
  });

  it('pages router with getStaticProps and revalidate number', () => {
    const features = createFeatures({
      hasGetStaticProps: true,
      hasRevalidate: true,
      revalidateValue: 60,
    });
    const pathAnalysis = createPathAnalysis({ isPagesRouter: true });
    const result = determineStrategy(features, pathAnalysis);
    expect(result.strategy).toBe('ISR');
  });

  it('pages router with getStaticProps and revalidate false', () => {
    const features = createFeatures({
      hasGetStaticProps: true,
      hasRevalidate: true,
      revalidateValue: false,
    });
    const pathAnalysis = createPathAnalysis({ isPagesRouter: true });
    const result = determineStrategy(features, pathAnalysis);
    expect(result.strategy).toBe('SSG');
  });

  it('pages router with getStaticProps and revalidate 0', () => {
    const features = createFeatures({
      hasGetStaticProps: true,
      hasRevalidate: true,
      revalidateValue: 0,
    });
    const pathAnalysis = createPathAnalysis({ isPagesRouter: true });
    const result = determineStrategy(features, pathAnalysis);
    expect(result.strategy).toBe('SSG');
  });

  it('pages router with getStaticProps and dynamic route with getStaticPaths', () => {
    const features = createFeatures({
      hasGetStaticProps: true,
      hasGetStaticPaths: true,
    });
    const dynamicSegment = createDynamicSegment();
    const pathAnalysis = createPathAnalysis({
      isPagesRouter: true,
      isDynamic: true,
      dynamicSegments: [dynamicSegment],
    });
    const result = determineStrategy(features, pathAnalysis);
    expect(result.strategy).toBe('SSG');
  });

  it('pages router with getStaticProps and dynamic route without getStaticPaths', () => {
    const features = createFeatures({ hasGetStaticProps: true });
    const dynamicSegment = createDynamicSegment();
    const pathAnalysis = createPathAnalysis({
      isPagesRouter: true,
      isDynamic: true,
      dynamicSegments: [dynamicSegment],
    });
    const result = determineStrategy(features, pathAnalysis);
    expect(result.strategy).toBe('SSR');
  });

  it('pages router with getStaticProps revalidate and dynamic route with getStaticPaths', () => {
    const features = createFeatures({
      hasGetStaticProps: true,
      hasRevalidate: true,
      revalidateValue: 60,
      hasGetStaticPaths: true,
    });
    const dynamicSegment = createDynamicSegment();
    const pathAnalysis = createPathAnalysis({
      isPagesRouter: true,
      isDynamic: true,
      dynamicSegments: [dynamicSegment],
    });
    const result = determineStrategy(features, pathAnalysis);
    expect(result.strategy).toBe('ISR');
  });

  it('pages router with getStaticProps revalidate and dynamic route without getStaticPaths', () => {
    const features = createFeatures({
      hasGetStaticProps: true,
      hasRevalidate: true,
      revalidateValue: 60,
    });
    const dynamicSegment = createDynamicSegment();
    const pathAnalysis = createPathAnalysis({
      isPagesRouter: true,
      isDynamic: true,
      dynamicSegments: [dynamicSegment],
    });
    const result = determineStrategy(features, pathAnalysis);
    expect(result.strategy).toBe('ISR');
  });

  it('pages router dynamic route without static generation', () => {
    const features = createFeatures();
    const dynamicSegment = createDynamicSegment();
    const pathAnalysis = createPathAnalysis({
      isPagesRouter: true,
      isDynamic: true,
      dynamicSegments: [dynamicSegment],
    });
    const result = determineStrategy(features, pathAnalysis);
    expect(result.strategy).toBe('SSR');
  });

  it('pages router client component', () => {
    const features = createFeatures({ isClientComponent: true });
    const pathAnalysis = createPathAnalysis({ isPagesRouter: true });
    const result = determineStrategy(features, pathAnalysis);
    expect(result.strategy).toBe('SSG');
  });

  it('pages router client component with hooks', () => {
    const features = createFeatures({
      isClientComponent: true,
      hasUseEffect: true,
      hasUseState: true,
    });
    const pathAnalysis = createPathAnalysis({ isPagesRouter: true });
    const result = determineStrategy(features, pathAnalysis);
    expect(result.strategy).toBe('SSG');
  });

  it('pages router default', () => {
    const features = createFeatures();
    const pathAnalysis = createPathAnalysis({ isPagesRouter: true });
    const result = determineStrategy(features, pathAnalysis);
    expect(result.strategy).toBe('SSG');
  });
});

describe('detects routing strategy in app router', () => {
  it('app router client component', () => {
    const features = createFeatures({ isClientComponent: true });
    const pathAnalysis = createPathAnalysis({ isAppRouter: true });
    const result = determineStrategy(features, pathAnalysis);
    expect(result.strategy).toBe('SSG');
  });

  it('app router client component with hooks', () => {
    const features = createFeatures({
      isClientComponent: true,
      hasUseEffect: true,
      hasUseState: true,
    });
    const pathAnalysis = createPathAnalysis({ isAppRouter: true });
    const result = determineStrategy(features, pathAnalysis);
    expect(result.strategy).toBe('SSG');
  });

  it('app router client component with searchParams', () => {
    const features = createFeatures({
      isClientComponent: true,
      usesSearchParams: true,
    });
    const pathAnalysis = createPathAnalysis({ isAppRouter: true });
    const result = determineStrategy(features, pathAnalysis);
    expect(result.strategy).toBe('SSG');
  });

  it('app router client component with dynamic route', () => {
    const features = createFeatures({ isClientComponent: true });
    const dynamicSegment = createDynamicSegment();
    const pathAnalysis = createPathAnalysis({
      isAppRouter: true,
      isDynamic: true,
      dynamicSegments: [dynamicSegment],
    });
    const result = determineStrategy(features, pathAnalysis);
    expect(result.strategy).toBe('SSG');
  });

  it('app router client component with revalidate', () => {
    const features = createFeatures({
      isClientComponent: true,
      hasRevalidate: true,
      revalidateValue: 60,
    });
    const pathAnalysis = createPathAnalysis({ isAppRouter: true });
    const result = determineStrategy(features, pathAnalysis);
    expect(result.strategy).toBe('ISR');
  });

  it('app router generateStaticParams without revalidate', () => {
    const features = createFeatures({ hasGenerateStaticParams: true });
    const dynamicSegment = createDynamicSegment();
    const pathAnalysis = createPathAnalysis({
      isAppRouter: true,
      isDynamic: true,
      dynamicSegments: [dynamicSegment],
    });
    const result = determineStrategy(features, pathAnalysis);
    expect(result.strategy).toBe('SSG');
  });

  it('app router generateStaticParams with revalidate', () => {
    const features = createFeatures({
      hasGenerateStaticParams: true,
      hasRevalidate: true,
      revalidateValue: 60,
    });
    const dynamicSegment = createDynamicSegment();
    const pathAnalysis = createPathAnalysis({
      isAppRouter: true,
      isDynamic: true,
      dynamicSegments: [dynamicSegment],
    });
    const result = determineStrategy(features, pathAnalysis);
    expect(result.strategy).toBe('ISR');
  });

  it('app router revalidate without generateStaticParams', () => {
    const features = createFeatures({
      hasRevalidate: true,
      revalidateValue: 60,
    });
    const pathAnalysis = createPathAnalysis({ isAppRouter: true });
    const result = determineStrategy(features, pathAnalysis);
    expect(result.strategy).toBe('ISR');
  });

  it('app router revalidate with dynamic route', () => {
    const features = createFeatures({
      hasRevalidate: true,
      revalidateValue: 60,
    });
    const dynamicSegment = createDynamicSegment();
    const pathAnalysis = createPathAnalysis({
      isAppRouter: true,
      isDynamic: true,
      dynamicSegments: [dynamicSegment],
    });
    const result = determineStrategy(features, pathAnalysis);
    expect(result.strategy).toBe('ISR');
  });

  it('app router fetchCache force-cache', () => {
    const features = createFeatures({ fetchCache: 'force-cache' });
    const pathAnalysis = createPathAnalysis({ isAppRouter: true });
    const result = determineStrategy(features, pathAnalysis);
    expect(result.strategy).toBe('SSG');
  });

  it('app router fetch with force-cache', () => {
    const features = createFeatures({ hasFetchWithForceCache: true });
    const pathAnalysis = createPathAnalysis({ isAppRouter: true });
    const result = determineStrategy(features, pathAnalysis);
    expect(result.strategy).toBe('SSG');
  });

  it('app router force-static', () => {
    const features = createFeatures({ dynamic: 'force-static' });
    const pathAnalysis = createPathAnalysis({ isAppRouter: true });
    const result = determineStrategy(features, pathAnalysis);
    expect(result.strategy).toBe('SSG');
  });

  it('app router unstable_cache without revalidate', () => {
    const features = createFeatures({ usesUnstableCache: true });
    const pathAnalysis = createPathAnalysis({ isAppRouter: true });
    const result = determineStrategy(features, pathAnalysis);
    expect(result.strategy).toBe('SSG');
  });

  it('app router unstable_cache with revalidate', () => {
    const features = createFeatures({
      usesUnstableCache: true,
      hasRevalidate: true,
      revalidateValue: 60,
    });
    const pathAnalysis = createPathAnalysis({ isAppRouter: true });
    const result = determineStrategy(features, pathAnalysis);
    expect(result.strategy).toBe('ISR');
  });

  it('app router dynamic route without static generation', () => {
    const features = createFeatures();
    const dynamicSegment = createDynamicSegment();
    const pathAnalysis = createPathAnalysis({
      isAppRouter: true,
      isDynamic: true,
      dynamicSegments: [dynamicSegment],
    });
    const result = determineStrategy(features, pathAnalysis);
    expect(result.strategy).toBe('SSR');
  });

  it('app router dynamic route with catch-all without static generation', () => {
    const features = createFeatures();
    const dynamicSegment = createDynamicSegment({
      segment: 'slug',
      catchAll: true,
      optional: false,
    });
    const pathAnalysis = createPathAnalysis({
      isAppRouter: true,
      isDynamic: true,
      dynamicSegments: [dynamicSegment],
    });
    const result = determineStrategy(features, pathAnalysis);
    expect(result.strategy).toBe('SSR');
  });

  it('app router dynamic route with optional catch-all without static generation', () => {
    const features = createFeatures();
    const dynamicSegment = createDynamicSegment({
      segment: 'slug',
      catchAll: true,
      optional: true,
    });
    const pathAnalysis = createPathAnalysis({
      isAppRouter: true,
      isDynamic: true,
      dynamicSegments: [dynamicSegment],
    });
    const result = determineStrategy(features, pathAnalysis);
    expect(result.strategy).toBe('SSR');
  });

  it('app router dynamic route with optional segment', () => {
    const features = createFeatures();
    const dynamicSegment = createDynamicSegment({
      segment: 'id',
      optional: true,
    });
    const pathAnalysis = createPathAnalysis({
      isAppRouter: true,
      isDynamic: true,
      dynamicSegments: [dynamicSegment],
    });
    const result = determineStrategy(features, pathAnalysis);
    expect(result.strategy).toBe('SSR');
  });

  it('app router dynamic route with filename segment', () => {
    const features = createFeatures();
    const dynamicSegment = createDynamicSegment({ isFilename: true });
    const pathAnalysis = createPathAnalysis({
      isAppRouter: true,
      isDynamic: true,
      dynamicSegments: [dynamicSegment],
    });
    const result = determineStrategy(features, pathAnalysis);
    expect(result.strategy).toBe('SSR');
  });

  it('app router multiple dynamic segments', () => {
    const features = createFeatures();
    const dynamicSegments = [
      createDynamicSegment({ segment: 'category', position: 0 }),
      createDynamicSegment({ segment: 'id', position: 1, catchAll: true }),
    ];
    const pathAnalysis = createPathAnalysis({
      isAppRouter: true,
      isDynamic: true,
      dynamicSegments,
    });
    const result = determineStrategy(features, pathAnalysis);
    expect(result.strategy).toBe('SSR');
  });

  it('app router layout component', () => {
    const features = createFeatures();
    const pathAnalysis = createPathAnalysis({
      isAppRouter: true,
      routeType: 'layout',
    });
    const result = determineStrategy(features, pathAnalysis);
    expect(result.strategy).toBe('SSG');
  });

  it('app router generateMetadata', () => {
    const features = createFeatures({ hasGenerateMetadata: true });
    const pathAnalysis = createPathAnalysis({ isAppRouter: true });
    const result = determineStrategy(features, pathAnalysis);
    expect(result.strategy).toBe('SSR');
  });

  it('app router static metadata', () => {
    const features = createFeatures({ hasMetadata: true });
    const pathAnalysis = createPathAnalysis({ isAppRouter: true });
    const result = determineStrategy(features, pathAnalysis);
    expect(result.strategy).toBe('SSG');
  });

  it('app router edge runtime without server context', () => {
    const features = createFeatures({ runtime: 'edge' });
    const pathAnalysis = createPathAnalysis({ isAppRouter: true });
    const result = determineStrategy(features, pathAnalysis);
    expect(result.strategy).toBe('SSG');
  });

  it('app router default', () => {
    const features = createFeatures();
    const pathAnalysis = createPathAnalysis({ isAppRouter: true });
    const result = determineStrategy(features, pathAnalysis);
    expect(result.strategy).toBe('SSG');
  });
});
