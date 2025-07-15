import { HTTP_METHODS } from './constants';

export type httpMethod = (typeof HTTP_METHODS)[number];
export interface IncomingWsMessage {
  action:
    | 'updateEnv'
    | 'discoverEnv'
    | 'discoverApi'
    | 'discoverAssets'
    | 'discoverRoutes'
    | 'readPackageJson';
  payload: any;
}

export interface updateEnvPayload {
  rootDir: string;
  filePath: string;
  updates: Record<string, string>;
}

export type OutgoingWsMessage<T> =
  | {
      success: true;
      payload: T;
    }
  | {
      success: false;
      payload: T;
      error: string;
    };

export type RouteInfo = string;

export interface AssetInfo {
  path: string;
  size: number;
}

export interface APIRouteInfo {
  path: string;
  method?: httpMethod[];
}

export interface EnvFileInfo {
  path: string;
  content: Record<string, string>;
}

export interface RoutingAnalysis {
  strategy: 'SSG' | 'ISR' | 'SSR';
  rationale: string[];
  dynamicSegments: DynamicSegment[];
  routeType: 'page' | 'layout' | 'api' | 'middleware' | 'unknown';
}

export interface DetectedFeatures {
  hasGetStaticProps: boolean;
  hasGetServerSideProps: boolean;
  hasGetStaticPaths: boolean;
  hasGenerateStaticParams: boolean;
  hasGenerateMetadata: boolean;
  hasMetadata: boolean;
  hasRevalidate: boolean;
  revalidateValue: number | boolean | undefined;
  runtime: string | undefined;
  fetchCache: string | undefined;
  dynamic: string | undefined;
  usesCookies: boolean;
  usesHeaders: boolean;
  usesSearchParams: boolean;
  usesNotFound: boolean;
  usesRedirect: boolean;
  usesUnstableCache: boolean;
  hasFetchWithNoStore: boolean;
  hasFetchWithForceCache: boolean;
  hasFetchWithRevalidate: boolean;
  isClientComponent: boolean;
  hasUseEffect: boolean;
  hasUseState: boolean;
}

export interface DynamicSegment {
  segment: string;
  catchAll: boolean;
  optional: boolean;
  position: number;
  isFilename: boolean;
  originalPattern: string;
}

export interface PathAnalysis {
  isAppRouter: boolean;
  isPagesRouter: boolean;
  isDynamic: boolean;
  dynamicSegments: DynamicSegment[];
  routeType: 'page' | 'layout' | 'api' | 'middleware' | 'unknown';
  segments: string[];
}
