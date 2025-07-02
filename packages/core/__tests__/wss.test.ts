import { it, beforeAll, afterAll, expect, vi } from 'vitest';
import { WebSocket, WebSocketServer } from 'ws';
import { Wss } from '../src/wss';
import { WSS_PORT } from '@next-dev-tools/shared/constants';
import * as Routeshandler from '../src/features/routes/handlers';
import * as Assetshandler from '../src/features/assets/handlers';
import {
  IncomingWsMessage,
  OutgoingWsMessage,
} from '@next-dev-tools/shared/types';
import { consola } from 'consola';

let server: WebSocketServer;

beforeAll(async () => {
  consola.pauseLogs();
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
      ws.send(JSON.stringify({ query: 'sys:ping' } as IncomingWsMessage));
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

it('calls discoverRoutesHandler on "discover:routes" message', async () => {
  const mockHandle = vi
    .spyOn(Routeshandler, 'discoverRoutesHandler')
    .mockImplementation(async (ws) => {
      ws.send(
        JSON.stringify({
          success: true,
          payload: ['route1', 'route2'],
        } as OutgoingWsMessage<string[]>),
      );
    });

  const ws = new WebSocket(`ws://localhost:${WSS_PORT}`);

  await new Promise<void>((resolve, reject) => {
    ws.on('open', () => {
      ws.send(
        JSON.stringify({ query: 'routes:discover' } as IncomingWsMessage),
      );
    });

    ws.on('message', (data) => {
      const msg = JSON.parse(data.toString());
      expect(mockHandle).toHaveBeenCalled();
      expect(msg.success).toBe(true);
      expect(msg.payload).toEqual(['route1', 'route2']);
      ws.close();
      resolve();
    });

    ws.on('error', reject);
  });

  mockHandle.mockRestore();
});

it('calls discoverAssetsHandler on "discover:routes" message', async () => {
  const mockHandle = vi
    .spyOn(Assetshandler, 'discoverAssetsHandler')
    .mockImplementation(async (ws) => {
      ws.send(
        JSON.stringify({
          success: true,
          payload: ['asset1', 'asset2'],
        } as OutgoingWsMessage<string[]>),
      );
    });

  const ws = new WebSocket(`ws://localhost:${WSS_PORT}`);

  await new Promise<void>((resolve, reject) => {
    ws.on('open', () => {
      ws.send(
        JSON.stringify({ query: 'assets:discover' } as IncomingWsMessage),
      );
    });

    ws.on('message', (data) => {
      const msg = JSON.parse(data.toString());
      expect(mockHandle).toHaveBeenCalled();
      expect(msg.success).toBe(true);
      expect(msg.payload).toEqual(['asset1', 'asset2']);
      ws.close();
      resolve();
    });

    ws.on('error', reject);
  });

  mockHandle.mockRestore();
});
