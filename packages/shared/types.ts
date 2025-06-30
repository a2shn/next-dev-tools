export interface IncomingWsMessage {
  type: 'routes' | 'ping';
  payload: string;
}

export type OutgoingWsMessage<T> =
  | {
      success: true;
      payload: T;
    }
  | {
      success: false;
      payload?: T;
      error: string;
    };

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
  isParallel: boolean;
  isIntercepting: boolean;
  isRouteGroup: boolean;
}
