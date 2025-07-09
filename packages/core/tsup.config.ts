import { defineConfig } from 'tsup';
import pkg from './package.json' with { type: 'json' };

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';

function getExternalDepsFromWorkspaces(pkgPath: string): string[] {
  const visited = new Set<string>();
  const externals = new Set<string>();

  function collectExternals(packageJsonPath: string) {
    const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    const deps = pkg.dependencies ?? {};

    for (const depName of Object.keys(deps)) {
      if (depName.startsWith('@next-dev-tools/')) {
        const depPath = resolve(
          dirname(packageJsonPath),
          '../../',
          depName.replace('@next-dev-tools/', 'packages/'),
          'package.json',
        );
        if (!visited.has(depPath)) {
          visited.add(depPath);
          collectExternals(depPath);
        }
      } else {
        externals.add(depName);
      }
    }
  }

  collectExternals(resolve(pkgPath));
  return Array.from(externals);
}

console.log(getExternalDepsFromWorkspaces('./package.json'));

export default defineConfig({
  outDir: 'dist',
  entry: ['src/index.ts'],
  dts: true,
  format: ['esm', 'cjs'],
  splitting: false,
  clean: true,
  bundle: true,
  sourcemap: true,
  noExternal: Object.keys(pkg.dependencies ?? {}).filter((name) =>
    name.startsWith('@next-dev-tools'),
  ),
  external: getExternalDepsFromWorkspaces('./package.json'),
});
