import type { DetectedFeatures } from '@next-dev-tools/shared/types';

export function createFeatures(): DetectedFeatures {
  return {
    hasGetStaticProps: false,
    hasGetServerSideProps: false,
    hasGetStaticPaths: false,
    hasGenerateStaticParams: false,
    hasGenerateMetadata: false,
    hasMetadata: false,
    hasRevalidate: false,
    revalidateValue: undefined,
    runtime: undefined,
    fetchCache: undefined,
    dynamic: undefined,
    usesCookies: false,
    usesHeaders: false,
    usesSearchParams: false,
    usesNotFound: false,
    usesRedirect: false,
    usesUnstableCache: false,
    hasFetchWithNoStore: false,
    hasFetchWithForceCache: false,
    hasFetchWithRevalidate: false,
    isClientComponent: false,
    hasUseEffect: false,
    hasUseState: false,
  };
}
