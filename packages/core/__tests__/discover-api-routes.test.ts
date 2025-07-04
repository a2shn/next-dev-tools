import { it, beforeAll, afterAll, expect } from 'vitest';
import { discoverAPIRoutes } from '../src/features/api/discover-api-routes';
import {
  createDummyWithContent,
  deleteDummy,
  testDirPath,
} from '../__fixtures__/utils';
import { APIRouteInfo } from '@next-dev-tools/shared/types';

let routes: APIRouteInfo[] = [];
const testDirName = 'dummy-api-routes';

beforeAll(async () => {
  createDummyWithContent({
    dir: testDirName,
    files: {
      'app/api/route.ts': `export function GET() { return new Response() }`,
      'app/api/users/route.ts': `export const POST = () => new Response()`,
      'app/api/users/[id]/route.ts': `export const PUT = () => new Response()`,
      'pages/api/users/[id].ts': `export default function handler(req, res) { res.status(200).end(); }`,
    },
  });

  routes = await discoverAPIRoutes(testDirPath(testDirName));
});

afterAll(() => {
  deleteDummy(testDirName);
});

it('discovers correct number of API routes', () => {
  expect(routes.length).toBe(4);
});

const expectedMethods = {
  'app/api/route.ts': ['GET'],
  'app/api/users/route.ts': ['POST'],
  'app/api/users/[id]/route.ts': ['PUT'],
  'pages/api/users/[id].ts': [],
};

for (const [file, methods] of Object.entries(expectedMethods)) {
  it(`correctly detects methods for ${file}`, () => {
    const route = routes.find((r) => r.path.endsWith(file));
    expect(route).toBeDefined();

    if (methods) {
      expect(route!.method).toEqual(methods);
    } else {
      expect(route!.method).toBeUndefined();
    }
  });
}
