export interface IncomingWsMessage {
  query: 'routes:discover' | 'sys:ping';
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

export interface AssetInfo {
  path: string;
  name: string;
  size: number;
  extension: string;
  lastModified: string;
  url: string | null;
  type: 'static' | 'dynamic' | 'inaccessible';
}
