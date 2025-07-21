import fs from 'fs/promises'
import { LRUCache } from 'lru-cache'
import { createHash } from 'crypto'
import { minify } from '@next-dev-tools/geist'

const cache = new LRUCache<
  string,
  { hash: string; data: unknown }
>({
  max: 1000,
  ttl: 1000 * 60 * 10
})

function checksum(input: string): string {
  return createHash('md5').update(input).digest('hex')
}
export async function withFileCache<T>(
  absPath: string,
  compute: (code: string) => Promise<T>
): Promise<T> {
  const rawCode = await fs.readFile(absPath, 'utf-8')
  const minified = minify(rawCode)
  const hash = checksum(minified)

  const cached = cache.get(absPath)
  if (cached && cached.hash === hash) {
    return cached.data as T
  }

  const result = await compute(rawCode)
  cache.set(absPath, { hash, data: result })
  return result
}

export function __clear() {
  cache.clear()
}
