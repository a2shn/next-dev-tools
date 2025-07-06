import fs from 'fs/promises';
import path from 'path';
// @ts-ignore
import { parse, stringify } from 'envfile';
import { updateEnvPayload } from '@next-dev-tools/shared/types';

function safeParseEnv(raw: string): Record<string, string> {
  const lines = raw.split('\n');
  const validLines = lines.filter((line) => line.includes('='));
  return parse(validLines.join('\n'));
}

export async function updateEnv({
  filePath,
  updates,
  rootDir,
}: updateEnvPayload) {
  const absPath = path.resolve(rootDir, filePath);

  try {
    await fs.access(absPath);
  } catch {
    throw new Error(`.env file does not exist: ${absPath}`);
  }

  const existing = await fs.readFile(absPath, 'utf-8');
  const parsed = safeParseEnv(existing);
  const merged = { ...parsed, ...updates };
  const final = stringify(merged);

  await fs.writeFile(absPath, final, 'utf-8');
}
