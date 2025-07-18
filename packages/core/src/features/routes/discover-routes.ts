import type { RouteInfo } from '@next-dev-tools/shared/types'
import fs from 'node:fs/promises'
import { join } from 'node:path'
import { detectRoutingStrategy } from '@next-dev-tools/geist'
import { NEXTJS_IGNORE_PATTERNS } from '@next-dev-tools/shared/constants'
import { glob } from 'tinyglobby'

export async function discoverRoutes(rootDir: string): Promise<RouteInfo[]> {
  const routePatterns = [
    'app/**/page.{js,jsx,ts,tsx}',
    'src/app/**/page.{js,jsx,ts,tsx}',
    'app/**/layout.{js,jsx,ts,tsx}',
    'src/app/**/layout.{js,jsx,ts,tsx}',
    'app/**/loading.{js,jsx,ts,tsx}',
    'src/app/**/loading.{js,jsx,ts,tsx}',
    'app/**/error.{js,jsx,ts,tsx}',
    'src/app/**/error.{js,jsx,ts,tsx}',
    'app/**/not-found.{js,jsx,ts,tsx}',
    'src/app/**/not-found.{js,jsx,ts,tsx}',
    'app/**/default.{js,jsx,ts,tsx}',
    'src/app/**/default.{js,jsx,ts,tsx}',
    'app/**/template.{js,jsx,ts,tsx}',
    'src/app/**/template.{js,jsx,ts,tsx}',
    'middleware.{js,jsx,ts,tsx}',
    'src/middleware.{js,jsx,ts,tsx}',
    'pages/**/*.{js,jsx,ts,tsx}',
    'src/pages/**/*.{js,jsx,ts,tsx}',
  ]

  const files = await glob(routePatterns, {
    cwd: rootDir,
    ignore: [...NEXTJS_IGNORE_PATTERNS, '**/api/**'],
    absolute: false,
  })

  const routes = await Promise.all(
    files.map(async (path) => {
      const absolutePath = join(rootDir, path)
      const source = await fs.readFile(absolutePath, 'utf8')
      const { detectedFeatures, pathAnalysis, strategy, rationale }
        = detectRoutingStrategy(source, path)
      return {
        path,
        detectedFeatures,
        pathAnalysis,
        strategy,
        rationale,
      }
    }),
  )
  return routes
}
