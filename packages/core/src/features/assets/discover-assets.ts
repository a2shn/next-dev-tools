import { glob } from 'tinyglobby';
import { stat } from 'fs/promises';
import path from 'path';
import { NEXTJS_IGNORE_PATTERNS } from '@next-dev-tools/shared/constants';
import { AssetInfo } from '@next-dev-tools/shared/types';

export async function discoverAssets(rootDir: string): Promise<AssetInfo[]> {
  const assetPatterns = [
    'public/**/*.{jpg,jpeg,png,gif,svg,webp,ico,bmp,tiff,avif}',
    'public/**/*.{mp4,avi,mov,wmv,flv,webm,mkv,m4v}',
    'public/**/*.{mp3,wav,flac,aac,ogg,wma,m4a}',
    'public/**/*.{pdf,doc,docx,txt,rtf,odt,zip,rar,7z,tar,gz,bz2}',
    'public/**/*.{json,xml,txt}',
    '{app,src/app}/**/*.{jpg,jpeg,png,gif,svg,webp,ico,bmp,tiff,avif}',
    '{app,src/app}/**/sitemap.{js,ts}',
    '{app,src/app}/**/robots.{js,ts}',
    '{app,src/app}/**/manifest.{js,ts}',
    '{app,src/app}/**/*icon*.{js,ts,tsx}',
    '{app,src/app}/**/*og-image*.{js,ts,tsx}',
    '{app,src/app}/**/*opengraph*.{js,ts,tsx}',
    '{app,src/app}/**/*twitter-image*.{js,ts,tsx}',
    '{app,src/app}/**/*apple-*icon*.{js,ts,tsx}',
    'pages/**/*.{jpg,jpeg,png,gif,svg,webp,ico}',
    'src/pages/**/*.{jpg,jpeg,png,gif,svg,webp,ico}',
  ];

  const files = await glob(assetPatterns, {
    ignore: NEXTJS_IGNORE_PATTERNS,
    dot: true,
    cwd: rootDir,
  });

  const assets: AssetInfo[] = [];

  for (const filePath of files) {
    const fullPath = path.resolve(rootDir, filePath);
    const stats = await stat(fullPath);
    const extension = path.extname(filePath);
    const name = path.basename(filePath);

    const assetInfo: AssetInfo = {
      path: filePath,
      name,
      size: stats.size,
      extension,
      lastModified: stats.mtime.toISOString(),
      url: generateAssetUrl(filePath),
      type: getAssetType(filePath),
    };

    assets.push(assetInfo);
  }

  return assets.sort((a, b) => a.path.localeCompare(b.path));
}

function generateAssetUrl(filePath: string): string | null {
  if (filePath.startsWith('public/')) {
    return filePath.replace('public/', '/');
  }

  if (filePath.includes('/app/') || filePath.startsWith('app/')) {
    if (filePath.includes('sitemap.')) {
      return '/sitemap.xml';
    }
    if (filePath.includes('robots.')) {
      return '/robots.txt';
    }
    if (filePath.includes('manifest.')) {
      return '/manifest.json';
    }
    if (filePath.includes('icon.') || filePath.includes('favicon.')) {
      return '/icon';
    }
    if (
      filePath.includes('apple-touch-icon') ||
      filePath.includes('apple-icon')
    ) {
      return '/apple-touch-icon';
    }
    if (filePath.includes('og-image') || filePath.includes('opengraph')) {
      const routePath = extractRouteFromPath(filePath);
      return routePath ? `${routePath}/opengraph-image` : '/opengraph-image';
    }
    if (filePath.includes('twitter-image')) {
      const routePath = extractRouteFromPath(filePath);
      return routePath ? `${routePath}/twitter-image` : '/twitter-image';
    }
    if (filePath.match(/\.(jpg|jpeg|png|gif|svg|webp|ico|bmp|tiff|avif)$/i)) {
      return null;
    }
  }

  if (filePath.includes('/pages/') || filePath.startsWith('pages/')) {
    if (filePath.match(/\.(jpg|jpeg|png|gif|svg|webp|ico|bmp|tiff|avif)$/i)) {
      return null;
    }
  }

  return null;
}

function extractRouteFromPath(filePath: string): string | null {
  const match = filePath.match(/(?:app|src\/app)\/(.+?)\/[^/]+$/);
  if (match) {
    return '/' + match[1];
  }
  return null;
}

function getAssetType(filePath: string): AssetInfo['type'] {
  if (filePath.startsWith('public/')) {
    return 'static';
  }
  if (
    filePath.match(/\.(js|ts|tsx)$/) &&
    (filePath.includes('sitemap') ||
      filePath.includes('robots') ||
      filePath.includes('manifest') ||
      filePath.includes('icon') ||
      filePath.includes('og-image') ||
      filePath.includes('opengraph') ||
      filePath.includes('twitter-image'))
  ) {
    return 'dynamic';
  }
  return 'inaccessible';
}
