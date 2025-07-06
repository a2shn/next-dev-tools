import { it, beforeAll, afterAll, expect, vi } from 'vitest';
import { WebSocket, WebSocketServer } from 'ws';
import { Wss } from '../src/wss';
import { WSS_PORT } from '@next-dev-tools/shared/constants';
import * as Routeshandler from '../src/features/routes/handlers';
import * as Assetshandler from '../src/features/assets/handlers';
import * as Apihandler from '../src/features/api/handlers';
import * as Envhandler from '../src/features/env/handlers';
import { IncomingWsMessage } from '@next-dev-tools/shared/types';
import { consola } from 'consola';

let server: WebSocketServer;

beforeAll(async () => {
  consola.pauseLogs();
  server = await Wss();
});

afterAll(() => {
  server?.close();
});

async function testWssAction(
  action: IncomingWsMessage['action'],
  expectedPayloadCheck?: (payload: any) => void,
) {
  const ws = new WebSocket(`ws://localhost:${WSS_PORT}`);

  await new Promise<void>((resolve, reject) => {
    ws.on('open', () => {
      ws.send(JSON.stringify({ action, payload: '' }));
    });

    ws.on('message', (data) => {
      const msg = JSON.parse(data.toString());
      expect(msg.success).toBe(true);
      if (expectedPayloadCheck) expectedPayloadCheck(msg.payload);
      ws.close();
      resolve();
    });

    ws.on('error', reject);
  });
}

it('responds with error on unknown message', async () => {
  const ws = new WebSocket(`ws://localhost:${WSS_PORT}`);

  await new Promise<void>((resolve, reject) => {
    ws.on('open', () => {
      ws.send(JSON.stringify({ command: 'nonExistentCommand' }));
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

it('handles systemPing action correctly', async () => {
  await testWssAction('pingSystem', (payload) => {
    expect(payload).toBeNull();
  });
});

it('handles discoverRoutes action correctly', async () => {
  const spy = vi
    .spyOn(Routeshandler, 'discoverRoutesHandler')
    .mockImplementation(async (ws) => {
      ws.send(JSON.stringify({ success: true, payload: ['route1', 'route2'] }));
    });

  await testWssAction('discoverRoutes', (payload) => {
    expect(Array.isArray(payload)).toBe(true);
    expect(payload.length).toBeGreaterThan(0);
  });

  spy.mockRestore();
});

it('handles discoverAssets action correctly', async () => {
  const spy = vi
    .spyOn(Assetshandler, 'discoverAssetsHandler')
    .mockImplementation(async (ws) => {
      ws.send(JSON.stringify({ success: true, payload: ['route1', 'route2'] }));
    });

  await testWssAction('discoverAssets', (payload) => {
    expect(Array.isArray(payload)).toBe(true);
    expect(payload.length).toBeGreaterThan(0);
  });

  spy.mockRestore();
});

it('handles discoverEnv action correctly', async () => {
  const spy = vi
    .spyOn(Envhandler, 'discoverEnvHandler')
    .mockImplementation(async (ws) => {
      ws.send(JSON.stringify({ success: true, payload: ['route1', 'route2'] }));
    });

  await testWssAction('discoverEnv', (payload) => {
    expect(Array.isArray(payload)).toBe(true);
    expect(payload.length).toBeGreaterThan(0);
  });

  spy.mockRestore();
});

it('handles updateEnv action correctly', async () => {
  const spy = vi
    .spyOn(Envhandler, 'updateEnvHandler')
    .mockImplementation(async (ws) => {
      ws.send(JSON.stringify({ success: true, payload: ['route1', 'route2'] }));
    });

  await testWssAction('updateEnv', (payload) => {
    expect(Array.isArray(payload)).toBe(true);
    expect(payload.length).toBeGreaterThan(0);
  });

  spy.mockRestore();
});

it('handles discoverAPIRoutes action correctly', async () => {
  const spy = vi
    .spyOn(Apihandler, 'discoverAPIRoutesHandler')
    .mockImplementation(async (ws) => {
      ws.send(JSON.stringify({ success: true, payload: ['route1', 'route2'] }));
    });

  await testWssAction('discoverApi', (payload) => {
    expect(Array.isArray(payload)).toBe(true);
    expect(payload.length).toBeGreaterThan(0);
  });

  spy.mockRestore();
});
