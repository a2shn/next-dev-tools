import type { EnvFileInfo } from '@next-dev-tools/shared/types'
import fs from 'node:fs/promises'
import path from 'node:path'
import { NEXTJS_IGNORE_PATTERNS } from '@next-dev-tools/shared/constants'
// @ts-expect-error module cannot be resolved
import { parse } from 'envfile'
import { glob } from 'tinyglobby'

export async function discoverEnv(rootDir: string): Promise<EnvFileInfo[]> {
  const envPatterns = ['.env', '.env.*', 'src/.env', 'src/.env.*']

  const files = await glob(envPatterns, {
    cwd: rootDir,
    ignore: NEXTJS_IGNORE_PATTERNS,
    absolute: false,
    dot: true,
  })

  const envFiles = await Promise.all(
    files.map(async (file) => {
      const absPath = path.join(rootDir, file)
      const content = await fs.readFile(absPath, 'utf-8')

      return {
        path: file,
        content: parse(content),
      }
    }),
  )

  return envFiles
}
