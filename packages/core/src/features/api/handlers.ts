import { respond } from '@/lib/utils';
import type { WebSocket } from 'ws';
import { discoverAPIRoutes } from './discover-api-routes';
import consola from 'consola';

export async function discoverAPIRoutesHandler(ws: WebSocket) {
  try {
    const cwd = process.cwd();

    const apiRoutes = await discoverAPIRoutes(cwd);

    respond(ws, {
      success: true,
      payload: apiRoutes,
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
