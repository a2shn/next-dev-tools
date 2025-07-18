import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

export async function readPackageJson(rootDir: string): Promise<string> {
  const path = resolve(rootDir, 'package.json')
  const content = await readFile(path, 'utf-8')
  return JSON.parse(content)
}
