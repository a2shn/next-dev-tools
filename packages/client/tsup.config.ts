import { defineConfig } from 'tsup'
import pkg from './package.json' with { type: 'json' }

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    splitting: false,
    clean: true,
    bundle: true,
  sourcemap: 'inline',
  noExternal: Object.keys(pkg.dependencies ?? {}).filter(name =>
    name.startsWith('@next-devtools'),
  ),
  external: [
    ...Object.keys(pkg.dependencies ?? {}).filter(
      name => !name.startsWith('@next-devtools'),
    ),
    ...Object.keys(pkg.peerDependencies ?? {}),
  ],
  loader: {
    ".css": "copy"
  }
})
