import { WSS_PORT } from '@next-dev-tools/shared/constants';
import { consola } from 'consola';
import { WebSocketServer } from 'ws';

export async function initWssServer(): Promise<void> {
  const port = WSS_PORT;
  const wss = new WebSocketServer({ port });

  consola.info(
    `[DEVTOOLS] 🛠 WebSocket Server started on ws://localhost:${port}`,
  );

  wss.on('connection', (ws, req) => {
    const clientIP = req.socket.remoteAddress;
    consola.success(`[DEVTOOLS] 🚀 Client connected from ${clientIP}`);

    ws.on('error', (err) => {
      consola.error(`[DEVTOOLS] WebSocket error:`, err);
    });

    ws.on('close', () => {
      consola.warn('[DEVTOOLS] 🔌 Client disconnected');
    });
  });
}
