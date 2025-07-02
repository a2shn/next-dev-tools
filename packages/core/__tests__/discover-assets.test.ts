import { beforeAll, afterAll, it, expect } from 'vitest';
import { discoverAssets } from '../src/features/assets/discover-assets';
import { createDummy, deleteDummy, testDirPath } from '../__fixtures__/utils';
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

it('discovers all dummy assets', () => {
  expect(assets.length).toBe(13);
});

it('correctly sets static public asset url', () => {
  const img = assets.find((a) => a.path.includes('public/images/logo.png'));
  expect(img?.url).toBe('/images/logo.png');
  expect(img?.type).toBe('static');
});

it('detects sitemap asset with dynamic url', () => {
  const sitemap = assets.find((a) => a.path.endsWith('app/sitemap.js'));
  expect(sitemap?.url).toBe('/sitemap.xml');
  expect(sitemap?.type).toBe('dynamic');
});

it('detects robots asset with dynamic url', () => {
  const robots = assets.find((a) => a.path.endsWith('app/robots.ts'));
  expect(robots?.url).toBe('/robots.txt');
  expect(robots?.type).toBe('dynamic');
});

it('detects manifest asset with dynamic url', () => {
  const manifest = assets.find((a) => a.path.endsWith('app/manifest.ts'));
  expect(manifest?.url).toBe('/manifest.json');
  expect(manifest?.type).toBe('dynamic');
});

it('detects favicon asset with dynamic url', () => {
  const favicon = assets.find((a) => a.path.endsWith('app/icons/favicon.ico'));
  expect(favicon?.url).toBe('/favicon.ico');
  expect(favicon?.type).toBe('dynamic');
});

it('detects opengraph image asset with correct route url', () => {
  const og = assets.find((a) => a.path.includes('opengraph/og-image.tsx'));
  expect(og?.url).toBe('/opengraph-image.png');
  expect(og?.type).toBe('dynamic');
});

it('detects twitter image asset with correct route url', () => {
  const twitter = assets.find((a) =>
    a.path.includes('twitter/twitter-image.tsx'),
  );
  expect(twitter?.url).toBe('/twitter/twitter-image.png');
  expect(twitter?.type).toBe('dynamic');
});

it('returns null for app image assets', () => {
  const appImg = assets.find((a) => a.path.includes('app/icons/favicon.ico'));
  expect(appImg?.url).toBe('/favicon.ico');
});

it('returns null url for pages images', () => {
  const pageImg = assets.find((a) =>
    a.path.includes('pages/images/banner.jpg'),
  );
  expect(pageImg?.url).toBeNull();
});

it('returns null for app image assets', () => {
  const appImg = assets.find((a) => a.path.includes('app/icons/favicon.ico'));
  expect(appImg?.url).toBe('/favicon.ico');
});

it('returns null url for pages images', () => {
  const pageImg = assets.find((a) =>
    a.path.includes('pages/images/banner.jpg'),
  );
  expect(pageImg?.url).toBeNull();
});
