import { promises as fs } from "fs"
import path from "path"
import consola from "consola"
import "@next-dev-tools/shared/types"
import { RouteDiscoveryOptions, RouteInfo } from "@next-dev-tools/shared/types"


async function discoverAppRoutes(appDir: string, includeApi: boolean): Promise<RouteInfo[]> {
    const routes: RouteInfo[] = []

    async function traverseAppDirectory(dir: string, routePath = ""): Promise<void> {
        try {
            const entries = await fs.readdir(dir, { withFileTypes: true })

            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name)

                if (entry.isDirectory()) {
                    if (shouldSkipDirectory(entry.name)) {
                        continue
                      }

                    const segmentPath = getRouteSegment(entry.name)
                    const newRoutePath = routePath + segmentPath

                    if (await hasPageFile(fullPath)) {
                        const routeType = getRouteType(entry.name)
                        routes.push({
                            path: newRoutePath || "/",
                            type: routeType,
                            router: "app",
                            file: fullPath,
                          })
                      }

                    if (includeApi && (await hasRouteFile(fullPath))) {
                        const routeType = getRouteType(entry.name)
                        routes.push({
                            path: `/api${newRoutePath}`,
                            type: routeType,
                            router: "app",
                            file: fullPath,
                          })
                      }

                    await traverseAppDirectory(fullPath, newRoutePath)
                  }
              }
          } catch (error) {
            consola.warn(`Warning: Could not read directory ${dir}:`, error)
          }
      }

    await traverseAppDirectory(appDir)
    return routes
}

async function discoverPagesRoutes(pagesDir: string, includeApi: boolean): Promise<RouteInfo[]> {
    const routes: RouteInfo[] = []

    async function traversePagesDirectory(dir: string, routePath = ""): Promise<void> {
        try {
            const entries = await fs.readdir(dir, { withFileTypes: true })

            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name)

                if (entry.isDirectory()) {
                    if (entry.name === "api" && !includeApi) {
                        continue
                      }

                    const segmentPath = entry.name === "api" ? "/api" : `/${entry.name}`
                    await traversePagesDirectory(fullPath, routePath + segmentPath)
                  } else if (entry.isFile() && isPageFile(entry.name)) {
                    if (!includeApi && routePath.startsWith("/api")) {
                        continue
                      }

                    const fileName = path.parse(entry.name).name
                    let finalRoutePath: string

                    if (fileName === "index") {
                        finalRoutePath = routePath || "/"
                      } else {
                        const segmentPath = getRouteSegment(fileName)
                        finalRoutePath = routePath + segmentPath
                      }

                    const routeType = getRouteType(fileName)
                    routes.push({
                        path: finalRoutePath,
                        type: routeType,
                        router: "pages",
                        file: fullPath,
                      })
                  }
              }
          } catch (error) {
            consola.warn(`Warning: Could not read directory ${dir}:`, error)
          }
      }

    await traversePagesDirectory(pagesDir)
    return routes
}

async function directoryExists(dir: string): Promise<boolean> {
    try {
        const stat = await fs.stat(dir)
        return stat.isDirectory()
      } catch {
        return false
      }
}

async function hasPageFile(dir: string): Promise<boolean> {
    try {
        const entries = await fs.readdir(dir)
        return entries.some((entry) => /^page\.(js|jsx|ts|tsx)$/.test(entry))
      } catch {
        return false
      }
}

async function hasRouteFile(dir: string): Promise<boolean> {
    try {
        const entries = await fs.readdir(dir)
        return entries.some((entry) => /^route\.(js|jsx|ts|tsx)$/.test(entry))
      } catch {
        return false
      }
}

function isPageFile(fileName: string): boolean {
    return /\.(js|jsx|ts|tsx)$/.test(fileName) && !fileName.startsWith("_") && !fileName.startsWith(".")
}

function shouldSkipDirectory(dirName: string): boolean {
    return (
        dirName.startsWith("_") ||
          dirName.startsWith(".") ||
          dirName === "node_modules" ||
          dirName === "components" ||
          dirName === "lib" ||
          dirName === "utils"
        )
}

function getRouteSegment(name: string): string {
    if (name.startsWith("[[...") && name.endsWith("]]")) {
        const param = name.slice(5, -2)
        return `/*${param}`
      } else if (name.startsWith("[...") && name.endsWith("]")) {
        const param = name.slice(4, -1)
        return `/*${param}`
      } else if (name.startsWith("[") && name.endsWith("]")) {
        const param = name.slice(1, -1)
        return `/:${param}`
      } else {
        return `/${name}`
      }
}

function getRouteType(name: string): RouteInfo["type"] {
    if (name.startsWith("[[...") && name.endsWith("]]")) {
        return "optional-catch-all"
      } else if (name.startsWith("[...") && name.endsWith("]")) {
        return "catch-all"
      } else if (name.startsWith("[") && name.endsWith("]")) {
        return "dynamic"
      } else {
        return "static"
      }
}

export async function getRouteDetails(options: RouteDiscoveryOptions = {}): Promise<RouteInfo[]> {
    const { rootDir = process.cwd(), includeApi = false } = options

    try {
        const routes: RouteInfo[] = []

        const appDir = path.join(rootDir, "app")
        if (await directoryExists(appDir)) {
            const appRoutes = await discoverAppRoutes(appDir, includeApi)
            routes.push(...appRoutes)
          }

        const pagesDir = path.join(rootDir, "pages")
        if (await directoryExists(pagesDir)) {
            const pageRoutes = await discoverPagesRoutes(pagesDir, includeApi)
            routes.push(...pageRoutes)
          }

        return routes.sort((a, b) => a.path.localeCompare(b.path))
      } catch (error) {
        consola.error("Error getting route details:", error)
        throw new Error(`Failed to get route details: ${error instanceof Error ? error.message : "Unknown error"}`)
      }
}
