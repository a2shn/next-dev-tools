import { beforeAll, afterAll, it, expect } from 'vitest';
import { discoverAssets } from './discover-assets';
import {
  createDummy,
  deleteDummy,
  testDirPath,
} from '@next-dev-tools/shared/test-utils';
import { AssetInfo } from '@next-dev-tools/shared/types';

const testDirName = 'dummy-assets';
let assets: AssetInfo[] = [];

beforeAll(async () => {
  createDummy({
    dir: testDirName,
    files: [
      'public/images/logo.png',
      'public/videos/intro.mp4',
      'public/audio/track.mp3',
      'public/docs/readme.pdf',
      'public/data/info.json',
      'app/sitemap.js',
      'app/robots.ts',
      'app/manifest.ts',
      'app/icons/favicon.ico',
      'app/opengraph/og-image.tsx',
      'app/twitter/twitter-image.tsx',
      'src/pages/icons/apple-touch-icon.tsx',
      'pages/images/banner.jpg',
    ],
  });
  assets = await discoverAssets(testDirPath(testDirName));
});

afterAll(() => {
  deleteDummy(testDirName);
});

it('discovers all dummy assets with correct size', () => {
  expect(assets.length).toBe(13);

  for (const asset of assets) {
    expect(typeof asset.size).toBe('number');
    expect(asset.size).toBeGreaterThanOrEqual(0);
  }
});
