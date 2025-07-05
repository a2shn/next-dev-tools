import { it, expect, beforeAll, afterAll } from 'vitest';
import { discoverEnv } from '../src/features/env/discover-env';
import {
  createDummyWithContent,
  deleteDummy,
  testDirPath,
} from '../__fixtures__/utils';

const dir = 'env-test';

beforeAll(() => {
  createDummyWithContent({
    dir,
    files: {
      '.env': 'FOO=bar\nHELLO=world',
      '.env.local': 'LOCAL=test',
      'ignore.txt': 'should not be picked up',
    },
  });
});

afterAll(() => {
  deleteDummy(dir);
});

it('discoverEnv finds and parses env files', async () => {
  const result = await discoverEnv(testDirPath(dir));

  expect(result).toEqual([
    {
      path: '.env',
      content: { FOO: 'bar', HELLO: 'world' },
    },
    {
      path: '.env.local',
      content: { LOCAL: 'test' },
    },
  ]);
});
