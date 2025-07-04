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
    '{app,src/app}/**/favicon.{ico,jpg,jpeg,png,svg,webp,avif}',
    '{app,src/app}/**/*icon*.{js,ts,tsx,jpg,jpeg,png,svg,webp,avif}',
    '{app,src/app}/**/apple-*icon*.{js,ts,tsx,jpg,jpeg,png,svg,webp,avif}',
    '{app,src/app}/**/opengraph-image*.{js,ts,tsx,jpg,jpeg,png,gif,svg,webp,avif}',
    '{app,src/app}/**/twitter-image*.{js,ts,tsx,jpg,jpeg,png,gif,svg,webp,avif}',
    '{app,src/app}/**/opengraph/**/*.{js,ts,tsx,jpg,jpeg,png,gif,svg,webp,avif}',
    '{app,src/app}/**/twitter/**/*.{js,ts,tsx,jpg,jpeg,png,gif,svg,webp,avif}',
    'pages/**/*.{jpg,jpeg,png,gif,svg,webp,ico,bmp,tiff,avif}',
    'src/pages/**/*.{jpg,jpeg,png,gif,svg,webp,ico,bmp,tiff,avif}',
    'src/pages/**/*icon*.{js,ts,tsx,jpg,jpeg,png,svg,webp,avif}',
  ];

  const files = await glob(assetPatterns, {
    ignore: NEXTJS_IGNORE_PATTERNS,
    dot: true,
    cwd: rootDir,
  });

  const assets: AssetInfo[] = await Promise.all(
    files.map(async (filePath) => {
      const fullPath = path.resolve(rootDir, filePath);
      const stats = await stat(fullPath);

      const assetInfo: AssetInfo = {
        path: filePath,
        size: stats.size,
      };

      return assetInfo;
    }),
  );

  return assets;
}
