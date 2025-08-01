import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { consola } from 'consola'
import { defineConfig } from 'tsup'
import pkg from './package.json' with { type: 'json' }

function getExternalDepsFromWorkspaces(pkgPath: string): string[] {
  const visited = new Set<string>()
  const externals = new Set<string>()

  function collectExternals(packageJsonPath: string) {
    const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
    const deps = pkg.dependencies ?? {}

    for (const depName of Object.keys(deps)) {
      if (depName.startsWith('@next-dev-tools/')) {
        const depPath = resolve(
          dirname(packageJsonPath),
          '../../',
          depName.replace('@next-dev-tools/', 'packages/'),
          'package.json',
        )

        if (!visited.has(depPath)) {
          visited.add(depPath)
          consola.info(`[WORKSPACE] Visiting ${depPath}`)
          collectExternals(depPath)
        }
      }
      else {
        consola.info(`[EXTERNAL] Adding "${depName}"`)
        externals.add(depName)
      }
    }
  }

  consola.start('Collecting external dependencies from workspaces...')
  collectExternals(resolve(pkgPath))
  return Array.from(externals)
}

const collectedExternals = getExternalDepsFromWorkspaces('./package.json')

consola.success(`Collected ${collectedExternals.length} external dependencies:`)
collectedExternals.forEach(dep => consola.log(`  • ${dep}`))

export default defineConfig({
  outDir: 'dist',
  entry: ['src/index.ts'],
  dts: true,
  format: ['esm', 'cjs'],
  splitting: false,
  clean: true,
  bundle: true,
  sourcemap: true,
  noExternal: Object.keys(pkg.dependencies ?? {}).filter(name =>
    name.startsWith('@next-dev-tools'),
  ),
})
