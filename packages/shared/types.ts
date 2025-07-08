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
  content: string;
}
