import WebSocket from 'ws';
import { respond } from './lib/utils';

export function handleRouteDetails(ws: WebSocket) {
  respond<string>(ws, {
    success: true,
    payload: 'Hello',
  });
}

export function handlePing(ws: WebSocket) {
  respond<'pong'>(ws, {
    success: true,
    payload: 'pong',
  });
}
