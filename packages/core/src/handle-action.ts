import type { IncomingWsMessage } from '@next-dev-tools/shared/types'
import type { WebSocket } from 'ws'
import process from 'node:process'
import { consola } from 'consola'
import { discoverAPIRoutes } from './features/api/discover-api-routes'
import { discoverAssets } from './features/assets/discover-assets'
import { discoverEnv } from './features/env/discover-env'
import { updateEnv } from './features/env/update-env'
import { readPackageJson } from './features/packages/read-package-json'
import { discoverRoutes } from './features/routes/discover-routes'
import { respond } from './lib/utils'

const rootDir = process.cwd()

const actionHandlers: {
  [K in IncomingWsMessage['action']]?: (
    payload: any,
  ) => Promise<any>
} = {
  readPackageJson: async () => readPackageJson(rootDir),
  updateEnv: async payload =>
    updateEnv({
      rootDir,
      filePath: payload.filePath,
      updates: payload.updates,
    }),
  discoverEnv: async () => discoverEnv(rootDir),
  discoverApiRoutes: async () => discoverAPIRoutes(rootDir),
  discoverAssets: async () => discoverAssets(rootDir),
  discoverRoutes: async () => discoverRoutes(rootDir),
}

export async function handleAction(
  ws: WebSocket,
  message: IncomingWsMessage,
): Promise<void> {
  const handler = actionHandlers[message.action]

  try {
    if (!handler) {
      consola.error(new Error(`[DEVTOOLS] Unknown action: ${message.action}`))
      respond(ws, {
        success: false,
        payload: [],
        error: 'Unknown message',
      })
      return
    }

    const payload = await handler(message.payload)
    respond(ws, { success: true, payload })
  }
  catch (err: any) {
    consola.error(
      new Error(`[DEVTOOLS] Failed to handle "${message.action}": ${err.message}`),
    )
    respond(ws, {
      success: false,
      payload: [],
      error: err.message,
    })
  }
}
