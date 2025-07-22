import fs from 'node:fs'
import path from 'node:path'
import {
  createDummyWithContent,
  deleteDummy,
  testDirPath,
} from '@next-dev-tools/shared/test-utils'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { __clear, withFileCache } from './with-file-cache'

const dir = 'withFileCache-test'
const fileName = 'api/hello.ts'
const fullPath = path.join(testDirPath(dir), fileName)

beforeEach(() => {
  createDummyWithContent({
    dir,
    files: {
      [fileName]: `export function handler(req, res) { res.end("hello") }`,
    },
  })
})

afterEach(() => {
  deleteDummy(dir)
  __clear()
})

it('uses cache if file content does not change', async () => {
  const fn = vi.fn(async (code: string) => [`result`, code])

  const result1 = await withFileCache(fullPath, fn)
  const result2 = await withFileCache(fullPath, fn)

  expect(result1).toEqual(result2)
  expect(fn).toHaveBeenCalledTimes(1)
})

it('recomputes if file content changes', async () => {
  const fn = vi.fn(async (code: string) => [`result`, code])

  await withFileCache(fullPath, fn)

  fs.writeFileSync(fullPath, `export const changed = ${Math.random()}`)

  await withFileCache(fullPath, fn)

  expect(fn).toHaveBeenCalledTimes(2)
})

it('throws if file does not exist', async () => {
  await expect(withFileCache('non-existent-file.ts', async () => ['x'])).rejects.toThrow()
})

it('does not cache result if compute throws', async () => {
  const compute = vi.fn(async () => {
    throw new Error('fail')
  })

  await expect(withFileCache(fullPath, compute)).rejects.toThrow('fail')
  await expect(withFileCache(fullPath, compute)).rejects.toThrow('fail')
  expect(compute).toHaveBeenCalledTimes(2)
})

it('caches large file content correctly', async () => {
  const largeContent = 'x'.repeat(1_000_000)
  fs.writeFileSync(fullPath, largeContent)

  const compute = vi.fn(async () => ['large'])
  const result = await withFileCache(fullPath, compute)
  expect(result).toEqual(['large'])
  expect(compute).toHaveBeenCalledTimes(1)

  const result2 = await withFileCache(fullPath, compute)
  expect(result2).toEqual(['large'])
  expect(compute).toHaveBeenCalledTimes(1)
})
