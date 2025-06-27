import { defineConfig } from 'tsup';
import pkg from './package.json' with { type: 'json' };

export default defineConfig({
  entry: ['src/index.ts'],
  dts: true,
  format: ['esm', 'cjs'],
  splitting: false,
  clean: true,
  bundle: true,
  sourcemap: 'inline',
  noExternal: Object.keys(pkg.dependencies ?? {}).filter((name) =>
    name.startsWith('@next-dev-tools'),
  ),
  external: [
    ...Object.keys(pkg.dependencies ?? {}).filter(
      (name) => !name.startsWith('@next-dev-tools'),
    ),
    ...Object.keys(pkg.peerDependencies ?? {}),
  ],
});
