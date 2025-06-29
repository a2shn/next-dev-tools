import { WebSocketOutcomingMessage } from '@next-dev-tools/shared/types';
import consola from 'consola';
import type { WebSocket } from 'ws';

export function respond<T>(
  ws: WebSocket,
  response: WebSocketOutcomingMessage<T>,
) {
  ws.send(JSON.stringify(response), (err?: Error) => {
    if (err) consola.error('[DEVTOOLS] Error occurred while sending', err);
  });
}
