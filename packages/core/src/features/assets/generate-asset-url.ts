export function generateAssetUrl(filePath: string): string | null {
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
    if (filePath.includes('favicon.')) {
      const extension =
        filePath.match(/\.(png|jpg|jpeg|svg|ico)$/i)?.[1] || 'ico';
      return `/favicon.${extension}`;
    }

    if (filePath.includes('icon.')) {
      const extension =
        filePath.match(/\.(png|jpg|jpeg|svg|ico)$/i)?.[1] || 'png';
      return `/icon.${extension}`;
    }
    if (
      filePath.includes('apple-touch-icon') ||
      filePath.includes('apple-icon')
    ) {
      const extension = filePath.match(/\.(png|jpg|jpeg)$/i)?.[1] || 'png';
      return `/apple-touch-icon.${extension}`;
    }
    if (
      filePath.includes('opengraph-image') ||
      filePath.includes('opengraph')
    ) {
      const routePath = extractRouteFromPath(filePath);
      const extension = filePath.match(/\.(png|jpg|jpeg)$/i)?.[1] || 'png';
      return routePath
        ? `${routePath}/opengraph-image.${extension}`
        : `/opengraph-image.${extension}`;
    }
    if (filePath.includes('twitter-image')) {
      const routePath = extractRouteFromPath(filePath);
      const extension = filePath.match(/\.(png|jpg|jpeg)$/i)?.[1] || 'png';
      return routePath
        ? `${routePath}/twitter-image.${extension}`
        : `/twitter-image.${extension}`;
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
  const match = filePath.match(/app\/(.+?)\/(?:opengraph-image|twitter-image)/);
  return match ? `/${match[1]}` : null;
}
