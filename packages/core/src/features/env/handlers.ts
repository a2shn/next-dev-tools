import { respond } from '@/lib/utils';
import type { WebSocket } from 'ws';
import { discoverEnv } from './discover-env';
import consola from 'consola';

export async function discoverEnvHandler(ws: WebSocket) {
  try {
    const cwd = process.cwd();

    const envFiles = await discoverEnv(cwd);

    respond(ws, {
      success: true,
      payload: envFiles,
    });
  } catch (err: any) {
    consola.error(new Error(err.message));
    respond(ws, {
      success: false,
      payload: [],
      error: 'Unexpected error occured while discovering routes',
    });
  }
}
