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

export async function handleAction(
  ws: WebSocket,
  message: IncomingWsMessage,
): Promise<void> {
  const rootDir = process.cwd()
  try {
    switch (message.action) {
      case 'readPackageJson':
        respond(ws, {
          success: true,
          payload: await readPackageJson(rootDir),
        })
        break
      case 'updateEnv':
        respond(ws, {
          success: true,
          payload: await updateEnv({
            rootDir,
            filePath: message.payload.filePath,
            updates: message.payload.updates,
          }),
        })
        break

      case 'discoverEnv':
        respond(ws, {
          success: true,
          payload: await discoverEnv(rootDir),
        })
        break

      case 'discoverApi':
        respond(ws, {
          success: true,
          payload: await discoverAPIRoutes(rootDir),
        })
        break

      case 'discoverAssets':
        respond(ws, {
          success: true,
          payload: await discoverAssets(rootDir),
        })
        break

      case 'discoverRoutes':
        respond(ws, {
          success: true,
          payload: await discoverRoutes(rootDir),
        })
        break
      default:
        consola.error(
          new Error(`[DEVTOOLS] Unknown action: ${message.action}`),
        )
        respond(ws, {
          success: false,
          payload: [],
          error: 'Unknown message',
        })
    }
  }
  catch (err: any) {
    consola.error(
      new Error(
        `[DEVTOOLS] Failed to handle "${message.action}": ${err.message}`,
      ),
    )
    respond(ws, {
      success: false,
      payload: [],
      error: err.message,
    })
  }
}
