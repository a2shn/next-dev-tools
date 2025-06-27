export interface WebSocketIncomingMessage {
  type: 'routes';
  payload: string;
}

export interface RouteDiscoveryOptions {
  rootDir?: string;
  includeApi?: boolean;
  includeDynamic?: boolean;
}

export interface RouteInfo {
  path: string;
  type: 'static' | 'dynamic' | 'catch-all' | 'optional-catch-all';
  router: 'app' | 'pages';
  file: string;
}
