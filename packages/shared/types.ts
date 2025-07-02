export interface IncomingWsMessage {
  query: 'assets:discover' | 'routes:discover' | 'sys:ping';
  payload: string;
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

export interface RouteInfo {
  path: string;
  name: string;
  routeType:
    | 'page'
    | 'layout'
    | 'loading'
    | 'error'
    | 'not-found'
    | 'route'
    | 'default'
    | 'template'
    | 'middleware'
    | 'pages-router';
  url: string | null;
  segments: string[];
  isApiRoute: boolean;
  routeGroups: string[];
  catchAll: boolean;
  optional: boolean;
  framework: 'app-router' | 'pages-router' | 'middleware';
}

export interface AssetInfo {
  path: string;
  name: string;
  size: number;
  extension: string;
  lastModified: string;
  url: string | null;
  type: 'static' | 'dynamic' | 'inaccessible';
}
