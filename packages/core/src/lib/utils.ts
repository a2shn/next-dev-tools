import { OutgoingWsMessage } from '@next-dev-tools/shared/types';
import consola from 'consola';
import type { WebSocket } from 'ws';

export function respond<T>(
  ws: WebSocket,
  responsePayload: OutgoingWsMessage<T>,
) {
  ws.send(JSON.stringify(responsePayload), (err?: Error) => {
    if (err)
      consola.error(
        new Error(`[DEVTOOLS] Error occurred while sending ${err}`),
      );
  });
}
