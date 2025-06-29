import { WSS_PORT } from '@next-dev-tools/shared/constants';
import type { IncomingWsMessage } from '@next-dev-tools/shared/types';
import { consola } from 'consola';
import { WebSocketServer } from 'ws';
import { respond } from './lib/utils';
import { handleGetRoutesQuery } from './features/get-routes/handler';

export async function Wss(): Promise<WebSocketServer> {
  const port = WSS_PORT;
  const wss = new WebSocketServer({ port });

  consola.info(
    `[DEVTOOLS] 🛠  WebSocket Server started on ws://localhost:${port}`,
  );

  wss.on('connection', (ws, req) => {
    const clientIP = req.socket.remoteAddress;
    consola.success(`[DEVTOOLS] 🚀 Client connected from ${clientIP}`);

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString()) as IncomingWsMessage;

        switch (message.type) {
          case 'routes':
            handleGetRoutesQuery(ws);
            break;
          case 'ping':
            respond(ws, {
              success: true,
              payload: null,
            });
            break;
          default:
            consola.warn(`[DEVTOOLS] Unknown message type: ${message.type}`);
            respond<null>(ws, {
              success: false,
              payload: null,
            });
        }
      } catch (err) {
        consola.error('[DEVTOOLS] Failed to parse message:', data);
      }
    });

    ws.on('error', (err) => {
      consola.error(`[DEVTOOLS] WebSocket error:`, err);
      respond(ws, {
        success: false,
        payload: null,
      });
    });

    ws.on('close', () => {
      consola.warn('[DEVTOOLS] 🔌 Client disconnected');
    });
  });

  return wss;
}
