import { AssetInfo } from '@next-dev-tools/shared/types';

export function getAssetType(filePath: string): AssetInfo['type'] {
  if (filePath.startsWith('public/')) {
    return 'static';
  }
  if (
    filePath.match(/\.(js|ts|tsx|ico)$/) &&
    (filePath.includes('sitemap') ||
      filePath.includes('robots') ||
      filePath.includes('manifest') ||
      filePath.includes('icon') ||
      filePath.includes('opengraph-image') ||
      filePath.includes('opengraph') ||
      filePath.includes('twitter-image'))
  ) {
    return 'dynamic';
  }
  return 'inaccessible';
}
