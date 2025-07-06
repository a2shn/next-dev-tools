import { respond } from '@/lib/utils';
import type { WebSocket } from 'ws';
import { discoverEnv } from './discover-env';
import consola from 'consola';
import { updateEnv } from './update-env';

export async function updateEnvHandler(ws: WebSocket, payload: any) {
  try {
    const cwd = process.cwd();

    await updateEnv({
      ...payload,
      rootDir: cwd,
    });

    respond(ws, {
      success: true,
      payload: [],
    });
  } catch (err: any) {
    consola.error(new Error(err.message));
    respond(ws, {
      success: false,
      payload: [],
      error: 'Unexpected error occured',
    });
  }
}

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
      error: 'Unexpected error occured',
    });
  }
}
