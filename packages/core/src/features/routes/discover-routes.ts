import { glob } from 'tinyglobby';

export async function discoverRoutes(
  rootDir: string = process.cwd(),
): Promise<string[]> {
  const extensions = '{js,jsx,ts,tsx}';

  const routePatterns = [
    `${rootDir}/app/**/page.${extensions}`,
    `${rootDir}/src/app/**/page.${extensions}`,
    `${rootDir}/app/**/layout.${extensions}`,
    `${rootDir}/src/app/**/layout.${extensions}`,
    `${rootDir}/app/**/loading.${extensions}`,
    `${rootDir}/src/app/**/loading.${extensions}`,
    `${rootDir}/app/**/error.${extensions}`,
    `${rootDir}/src/app/**/error.${extensions}`,
    `${rootDir}/app/**/not-found.${extensions}`,
    `${rootDir}/src/app/**/not-found.${extensions}`,
    `${rootDir}/app/**/route.${extensions}`,
    `${rootDir}/src/app/**/route.${extensions}`,
    `${rootDir}/app/**/default.${extensions}`,
    `${rootDir}/src/app/**/default.${extensions}`,
    `${rootDir}/app/**/template.${extensions}`,
    `${rootDir}/src/app/**/template.${extensions}`,
    `${rootDir}/pages/**/*.${extensions}`,
    `${rootDir}/src/pages/**/*.${extensions}`,
    `${rootDir}/middleware.${extensions}`,
    `${rootDir}/src/middleware.${extensions}`,
  ];

  const routes = await glob(routePatterns, {
    ignore: ['**/node_modules/**'],
    absolute: true,
  });

  return routes;
}
