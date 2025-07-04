import { HTTP_METHODS } from './constants';

export type httpMethod = (typeof HTTP_METHODS)[number];

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

export type RouteInfo = string;

export interface AssetInfo {
  path: string;
  size: number;
}

export interface APIRouteInfo {
  path: string;
  method?: httpMethod[];
}
