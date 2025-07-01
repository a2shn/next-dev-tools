import { respond } from '@/lib/utils';
import type { WebSocket } from 'ws';
import { discoverRoutes } from './discover-routes';
import consola from 'consola';

export async function discoverRoutesHandler(ws: WebSocket) {
  try {
    const cwd = process.cwd();

    const routes = await discoverRoutes(cwd);

    if (routes.length === 0) {
      respond(ws, {
        success: false,
        payload: [],
        error: 'No routes were found. Create an issue on Github!',
      });
    }

    respond(ws, {
      success: true,
      payload: routes,
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
