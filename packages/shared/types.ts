export interface IncomingWsMessage {
  type: 'routes' | 'ping';
  payload: string;
}

export interface OutgoingWsMessage<T> {
  success: boolean;
  payload: T;
}

export interface RouteInfo {
  path: string;
  type:
    | 'page'
    | 'layout'
    | 'loading'
    | 'error'
    | 'not-found'
    | 'route'
    | 'default'
    | 'template'
    | 'api'
    | 'app'
    | 'document'
    | 'custom-error'
    | '404'
    | '500'
    | 'middleware';
  router: 'app' | 'pages';
  isDynamic: boolean;
  isParallel: boolean;
  isIntercepting: boolean;
  isRouteGroup: boolean;
  segments: string[];
}
