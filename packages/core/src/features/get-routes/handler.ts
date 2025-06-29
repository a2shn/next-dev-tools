import { respond } from '@/lib/utils';
import type { WebSocket } from 'ws';

export function handleGetRoutesQuery(ws: WebSocket) {
  respond(ws, {
    success: true,
    payload: null,
  });
}
