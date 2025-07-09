import { glob } from 'tinyglobby';
import { NEXTJS_IGNORE_PATTERNS } from '@next-dev-tools/shared/constants';
import fs from 'fs/promises';
import path from 'path';
import type { EnvFileInfo } from '@next-dev-tools/shared/types';
// @ts-ignore
import { parse } from 'envfile';

export async function discoverEnv(
  rootDir: string = process.cwd(),
): Promise<EnvFileInfo[]> {
  const envPatterns = ['.env', '.env.*', 'src/.env', 'src/.env.*'];

  const files = await glob(envPatterns, {
    cwd: rootDir,
    ignore: NEXTJS_IGNORE_PATTERNS,
    absolute: false,
    dot: true,
  });

  const envFiles = await Promise.all(
    files.map(async (file) => {
      const absPath = path.join(rootDir, file);
      const content = await fs.readFile(absPath, 'utf-8');

      return {
        path: file,
        content: parse(content),
      };
    }),
  );

  return envFiles;
}
