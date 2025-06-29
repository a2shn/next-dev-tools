import { it, beforeAll, afterAll, expect } from 'vitest';
import { WebSocket, WebSocketServer } from 'ws';
import { Wss } from './wss';
import { WSS_PORT } from '@next-dev-tools/shared/constants';

let server: WebSocketServer;

beforeAll(async () => {
  server = await Wss();
});

afterAll(() => {
  server?.close();
});

it('responds with error on unknown message', async () => {
  const ws = new WebSocket(`ws://localhost:${WSS_PORT}`);

  await new Promise<void>((resolve, reject) => {
    ws.on('open', () => {
      ws.send(JSON.stringify({ type: 'non-existent' }));
    });

    ws.on('message', (data) => {
      const msg = JSON.parse(data.toString());
      expect(msg.success).toBe(false);
      ws.close();
      resolve();
    });

    ws.on('error', reject);
  });
});

it('handles ping message and responds with success', async () => {
  const ws = new WebSocket(`ws://localhost:${WSS_PORT}`);

  await new Promise<void>((resolve, reject) => {
    ws.on('open', () => {
      ws.send(JSON.stringify({ type: 'ping' }));
    });

    ws.on('message', (data) => {
      const msg = JSON.parse(data.toString());
      expect(msg.success).toBe(true);
      expect(msg.payload).toBeNull();
      ws.close();
      resolve();
    });

    ws.on('error', reject);
  });
});
