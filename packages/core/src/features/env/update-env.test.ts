import { it, expect, beforeAll, afterAll } from 'vitest';
import { updateEnv } from './update-env';
import {
  createDummyWithContent,
  deleteDummy,
  testDirPath,
} from '@next-dev-tools/shared/test-utils';
import { parse } from 'envfile';
import fs from 'fs/promises';
import path from 'path';

const dir = 'env-update-test';

beforeAll(() => {
  createDummyWithContent({
    dir,
    files: {
      '.env': 'FOO=bar\nHELLO=world',
      '.env.malformed': 'FOO=bar\nINVALID_LINE\nHELLO=world',
    },
  });
});

afterAll(() => {
  deleteDummy(dir);
});

it('updates existing keys and adds new ones', async () => {
  const envPath = path.join(testDirPath(dir), '.env');

  await updateEnv({
    filePath: envPath,
    updates: {
      HELLO: 'planet',
      NEW_KEY: 'new_value',
    },
  });

  const raw = await fs.readFile(envPath, 'utf-8');
  const parsed = parse(raw);

  expect(parsed).toEqual({
    FOO: 'bar',
    HELLO: 'planet',
    NEW_KEY: 'new_value',
  });
});

it('throws if file does not exist', async () => {
  const missingPath = path.join(testDirPath(dir), '.missing');

  await expect(() =>
    updateEnv({
      filePath: missingPath,
      updates: { FOO: 'bar' },
    }),
  ).rejects.toThrowError(/does not exist/);
});

it('throws when .env file is malformed', async () => {
  const envPath = path.join(testDirPath(dir), '.env.malformed');

  await updateEnv({
    filePath: envPath,
    updates: { HELLO: 'planet' },
  });
});
