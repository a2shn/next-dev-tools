import fs from 'node:fs'
import path from 'node:path'
import {
  createDummyWithContent,
  deleteDummy,
  testDirPath,
} from '@next-dev-tools/shared/test-utils'
import { afterAll, beforeAll, expect, it } from 'vitest'
import { detectAPIMethod } from './index'

const testDir = 'api-method-tests'

beforeAll(() => {
  createDummyWithContent({
    files: {
      'route-function-declaration.ts': `export function GET() { return new Response() }`,
      'route-variable-arrow.ts': `export const POST = () => new Response()`,
      'route-variable-function.ts': `export const PUT = function() { return new Response() }`,
      'route-multiple.ts': `
        export function GET() { return new Response() }
        export const POST = () => new Response()
        const PATCH = function() { return new Response() }
export { PATCH }
      `,
      'route-invalid.ts': `
        export function randomFunc() {}
        export const notAMethod = () => {}
      `,
    },
    dir: testDir,
  })
})

afterAll(() => {
  deleteDummy(testDir)
})

it('detects GET with function declaration', async () => {
  const file = path.join(testDirPath(testDir), 'route-function-declaration.ts')
  const code = fs.readFileSync(file, 'utf-8')
  const result = await detectAPIMethod(code)
  expect(result).toContain('GET')
})

it('detects POST with arrow function', async () => {
  const file = path.join(testDirPath(testDir), 'route-variable-arrow.ts')
  const code = fs.readFileSync(file, 'utf-8')
  const result = await detectAPIMethod(code)
  expect(result).toContain('POST')
})

it('detects PUT with function expression', async () => {
  const file = path.join(testDirPath(testDir), 'route-variable-function.ts')
  const code = fs.readFileSync(file, 'utf-8')
  const result = await detectAPIMethod(code)
  expect(result).toContain('PUT')
})

it('detects multiple API methods in one file', async () => {
  const file = path.join(testDirPath(testDir), 'route-multiple.ts')
  const code = fs.readFileSync(file, 'utf-8')
  const result = await detectAPIMethod(code)
  expect(result).toContain('GET')
  expect(result).toContain('POST')
  expect(result).toContain('PATCH')
})

it('returns empty array for files with no valid methods', async () => {
  const file = path.join(testDirPath(testDir), 'route-invalid.ts')
  const code = fs.readFileSync(file, 'utf-8')
  const result = await detectAPIMethod(code)
  expect(result).toEqual([])
})
