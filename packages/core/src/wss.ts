import type { IncomingWsMessage } from '@next-dev-tools/shared/types'
import { WSS_PORT } from '@next-dev-tools/shared/constants'
import { consola } from 'consola'
import { WebSocketServer } from 'ws'
import { handleAction } from './handle-action'
import { respond } from './lib/utils'

export async function Wss(): Promise<WebSocketServer> {
  const port = WSS_PORT
  const wss = new WebSocketServer({ port, autoPong: true })

  consola.start(
    `[DEVTOOLS] 🛠  WebSocket Server starting on ws://localhost:${port}`,
  )

  wss.on('connection', (ws, req) => {
    const clientIP = req.socket.remoteAddress
    consola.success(`[DEVTOOLS] 🚀 Client connected from ${clientIP}`)

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString()) as IncomingWsMessage
        await handleAction(ws, message)
      }
      catch (err: any) {
        consola.error(new Error('[DEVTOOLS] Failed to parse message'))
        respond(ws, {
          success: false,
          payload: [],
          error: err.message,
        })
      }
    })

    ws.on('error', (err) => {
      consola.error(new Error(`[DEVTOOLS] WebSocket error: ${err.message}`))
      respond(ws, {
        success: false,
        error: err.message,
        payload: [],
      })
    })

    ws.on('close', () => {
      consola.warn('[DEVTOOLS] 🔌 Client disconnected')
    })
  })

  return wss
}
