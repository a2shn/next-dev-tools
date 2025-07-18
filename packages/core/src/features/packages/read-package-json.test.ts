import {
  createDummyWithContent,
  deleteDummy,
  testDirPath,
} from '@next-dev-tools/shared/test-utils'
import { afterAll, beforeAll, expect, it } from 'vitest'
import { readPackageJson } from './read-package-json'

const dir = 'read-package-json-test'

beforeAll(() => {
  const dummyPkg = {
    name: 'dummy-project',
    version: '1.0.0',
    scripts: {
      test: 'vitest',
    },
  }
  createDummyWithContent({
    dir,
    files: { 'package.json': JSON.stringify(dummyPkg, null, 2) },
  })
})

afterAll(() => {
  deleteDummy(dir)
})

it('reads package.json and parses content', async () => {
  const pkg = await readPackageJson(testDirPath(dir))
  expect(pkg).toHaveProperty('name', 'dummy-project')
  expect(pkg).toHaveProperty('version', '1.0.0')
  expect(pkg.scripts).toHaveProperty('test', 'vitest')
})
