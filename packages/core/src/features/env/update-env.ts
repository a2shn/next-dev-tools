import type { updateEnvPayload } from '@next-dev-tools/shared/types'
import fs from 'node:fs/promises'
import path from 'node:path'
// @ts-expect-error module cannot be resolved
import { parse, stringify } from 'envfile'

function safeParseEnv(raw: string): Record<string, string> {
  const lines = raw.split('\n')
  const validLines = lines.filter(line => line.includes('='))
  return parse(validLines.join('\n'))
}

export async function updateEnv({
  filePath,
  updates,
  rootDir,
}: updateEnvPayload): Promise<void> {
  const absPath = path.resolve(rootDir, filePath)

  try {
    await fs.access(absPath)
  }
  catch {
    throw new Error(`.env file does not exist: ${absPath}`)
  }

  const existing = await fs.readFile(absPath, 'utf-8')
  const parsed = safeParseEnv(existing)
  const merged = { ...parsed, ...updates }
  const final = stringify(merged)

  await fs.writeFile(absPath, final, 'utf-8')
}
