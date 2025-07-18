import type { OutgoingWsMessage } from '@next-dev-tools/shared/types'
import type { WebSocket } from 'ws'
import { consola } from 'consola'

export function respond<T>(
  ws: WebSocket,
  responsePayload: OutgoingWsMessage<T>,
): void {
  ws.send(JSON.stringify(responsePayload), (err?: Error) => {
    if (err) {
      consola.error(
        new Error(`[DEVTOOLS] Error occurred while sending ${err}`),
      )
    }
  })
}
