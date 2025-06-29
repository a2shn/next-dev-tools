export interface WebSocketIncomingMessage {
  type: 'routes' | 'ping';
  payload: string;
}

export interface WebSocketOutcomingMessage<T> {
  success: boolean;
  payload: T;
}

export interface RouteInfo {
  path: string;
  type: 'static' | 'dynamic' | 'catch-all' | 'optional-catch-all';
  router: 'app' | 'pages';
  file: string;
}
