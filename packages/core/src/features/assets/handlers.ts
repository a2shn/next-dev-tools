import { respond } from '@/lib/utils';
import type { WebSocket } from 'ws';
import { discoverAssets } from './discover-assets';
import consola from 'consola';

export async function discoverAssetsHandler(ws: WebSocket) {
  try {
    const cwd = process.cwd();

    const assets = await discoverAssets(cwd);

    respond(ws, {
      success: true,
      payload: assets,
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
