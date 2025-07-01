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
