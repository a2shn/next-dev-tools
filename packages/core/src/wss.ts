import { WSS_PORT } from '@next-dev-tools/shared/constants';
import type { IncomingWsMessage } from '@next-dev-tools/shared/types';
import { consola } from 'consola';
import { WebSocketServer } from 'ws';
import { respond } from './lib/utils';
import { discoverRoutesHandler } from './features/routes/handlers';
import { discoverAssetsHandler } from './features/assets/handlers';
import { discoverAPIRoutesHandler } from './features/api/handlers';

export async function Wss(): Promise<WebSocketServer> {
  const port = WSS_PORT;
  const wss = new WebSocketServer({ port });

  consola.start(
    `[DEVTOOLS] 🛠  WebSocket Server starting on ws://localhost:${port}`,
  );

  wss.on('connection', (ws, req) => {
    const clientIP = req.socket.remoteAddress;
    consola.success(`[DEVTOOLS] 🚀 Client connected from ${clientIP}`);

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString()) as IncomingWsMessage;

        switch (message.action) {
          case 'discoverApi':
            await discoverAPIRoutesHandler(ws);
            break;
          case 'discoverAssets':
            await discoverAssetsHandler(ws);
            break;
          case 'discoverRoutes':
            await discoverRoutesHandler(ws);
            break;
          case 'pingSystem':
            respond(ws, {
              success: true,
              payload: null,
            });
            break;
          default:
            consola.error(
              new Error(`[DEVTOOLS] Unknown action: ${message.action}`),
            );
            respond(ws, {
              success: false,
              payload: [],
              error: 'Unknown message',
            });
        }
      } catch (err) {
        consola.error(new Error('[DEVTOOLS] Failed to parse message'));
      }
    });

    ws.on('error', (err) => {
      consola.error(new Error(`[DEVTOOLS] WebSocket error: ${err.message}`));
      respond(ws, {
        success: false,
        error: err.message,
        payload: [],
      });
    });

    ws.on('close', () => {
      consola.warn('[DEVTOOLS] 🔌 Client disconnected');
    });
  });

  return wss;
}
